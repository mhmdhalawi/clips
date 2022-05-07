import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  videoOrder = '1';
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

    this.clipService.getUserClips().subscribe(console.log);
  }

  sort(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: value },
    });
  }
}
