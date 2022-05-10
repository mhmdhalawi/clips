import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  providers: [DatePipe],
})
export class ClipsListComponent implements OnInit, OnDestroy {
  @Input() scrollable: boolean = true;
  constructor(public clipService: ClipService) {
    this.clipService.getClips();
  }

  handleScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;

    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

    if (bottomOfWindow) {
      this.clipService.getClips();
    }
  };

  ngOnInit(): void {
    this.scrollable && window.addEventListener('scroll', this.handleScroll);
  }
  ngOnDestroy(): void {
    this.scrollable && window.removeEventListener('scroll', this.handleScroll);

    this.clipService.pageClips = [];
  }
}
