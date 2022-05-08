import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ClipService } from 'src/app/services/clip.service';
import { IClip } from 'src/app/models/clip.model';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  videoOrder = '1';

  clips: IClip[] = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((paramMap: Params) => {
      const { sort } = paramMap.params;

      this.videoOrder = sort === '2' ? sort : '1';
    });

    this.clipService.getUserClips().subscribe((docs) => {
      this.clips = [];
      docs.forEach((doc) => {
        this.clips.push({
          docID: doc.id,
          ...doc.data(),
        });
      });
    });
  }

  sort(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: value },
    });
  }
}
