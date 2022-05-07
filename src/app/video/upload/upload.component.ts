import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit {
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

  title = new FormControl('', [Validators.required, Validators.minLength(3)]);

  uploadForm = new FormGroup({
    title: this.title,
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService
  ) {
    this.auth.user.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit(): void {}

  storeFile(event: DragEvent): void {
    this.isDragOver = false;

    this.file = event.dataTransfer?.files[0] || null;

    if (!this.file || this.file.type !== 'video/webm') {
      this.file = null;
    }

    this.title.setValue(this.file?.name.replace(/\.[^.]*$/, ''));

    this.nextStep = true;
  }

  uploadFile(): void {
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertColor = 'bg-blue-400';
    this.alertMsg = 'Please wait! Your clip is being uploaded...';
    this.inSubmission = true;
    this.showPercentage = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.webm`;

    const task = this.storage.upload(clipPath, this.file);

    task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });

    const clipRef = this.storage.ref(clipPath);

    task
      .snapshotChanges()
      .pipe(
        last(),
        switchMap(() => clipRef.getDownloadURL())
      )
      .subscribe({
        next: (url) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.webm`,
            url,
          };

          this.clipService.createClip(clip);

          this.alertColor = 'bg-green-400';
          this.alertMsg = 'Your clip has been uploaded!';
          this.showPercentage = false;
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
