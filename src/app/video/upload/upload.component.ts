import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { combineLatest, forkJoin, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  isDragOver: boolean = false;

  file: File | null = null;

  nextStep: boolean = false;

  showAlert = false;
  alertColor = 'bg-blue-400';
  alertMsg = 'Please wait! Your clip is being uploaded...';
  inSubmission = false;

  percentage: number = 0;
  showPercentage: boolean = false;

  user: firebase.User | null = null;

  task?: AngularFireUploadTask;

  title = new FormControl('', [Validators.required, Validators.minLength(3)]);

  uploadForm = new FormGroup({
    title: this.title,
  });

  screenshots: string[] = [];

  selectedScreenshot = '';

  screenshotTask?: AngularFireUploadTask;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    this.auth.user.subscribe((user) => {
      this.user = user;
    });
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  async storeFile(event: Event) {
    if (this.ffmpegService.isRunning) return;

    this.isDragOver = false;

    this.file = (event as DragEvent).dataTransfer
      ? (event as DragEvent).dataTransfer?.files[0] || null
      : (event.target as HTMLInputElement).files?.item(0) || null;

    if (!this.file || this.file.type !== 'video/webm') {
      this.file = null;
    }

    if (this.file) {
      this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    }

    this.selectedScreenshot = this.screenshots[0];

    this.title.setValue(this.file?.name.replace(/\.[^.]*$/, ''));

    this.nextStep = true;
  }

  async uploadFile() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertColor = 'bg-blue-400';
    this.alertMsg = 'Please wait! Your clip is being uploaded...';
    this.inSubmission = true;
    this.showPercentage = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.webm`;

    const screenshotBlob = await this.ffmpegService.blobFromUrl(
      this.selectedScreenshot
    );

    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.task = this.storage.upload(clipPath, this.file);

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);

    const screenshotRef = this.storage.ref(screenshotPath);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;
      if (!clipProgress || !screenshotProgress) return;
      const total = clipProgress + screenshotProgress;
      this.percentage = total / 200;
    });

    const clipRef = this.storage.ref(clipPath);

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipUrl, screenshotUrl] = urls;
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.webm`,
            url: clipUrl,
            screenshotUrl,
            screenshotFileName: `${clipFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          const clipDocRef = await this.clipService.createClip(clip);

          this.alertColor = 'bg-green-400';
          this.alertMsg = 'Your clip has been uploaded!';
          this.showPercentage = false;

          setTimeout(() => {
            this.router.navigate(['/clip', clipDocRef.id]);
          }, 800);
        },
        error: (error) => {
          this.uploadForm.enable();
          this.alertColor = 'bg-red-400';
          this.alertMsg = 'Upload Failed! Please try again later.';
          this.inSubmission = false;
          this.showPercentage = false;

          console.error(error);
        },
      });
  }
}
