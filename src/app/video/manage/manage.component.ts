import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ClipService } from 'src/app/services/clip.service';
import { IClip } from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  videoOrder = '1';

  clips: IClip[] = [];

  activeClip: IClip | null = null;

  sort$: BehaviorSubject<string>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modal: ModalService
  ) {
    this.sort$ = new BehaviorSubject(this.videoOrder);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((paramMap: Params) => {
      const { sort } = paramMap.params;

      this.videoOrder = sort === '2' ? sort : '1';

      this.sort$.next(this.videoOrder);
    });

    this.clipService.getUserClips(this.sort$).subscribe((docs) => {
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

  openModal($event: MouseEvent, clip: IClip): void {
    $event.preventDefault();

    this.activeClip = clip;

    this.modal.toggleModal('editClip');
  }

  update($event: IClip) {
    this.clips = [
      ...this.clips.filter((clip) => {
        if (clip.docID !== $event.docID) return clip;
        else return $event;
      }),
    ];
  }

  deleteClip($event: MouseEvent, clip: IClip) {
    $event.preventDefault();

    this.clipService.deleteClip(clip);

    this.clips = this.clips.filter((oldclip) => oldclip.docID !== clip.docID);
  }
}
