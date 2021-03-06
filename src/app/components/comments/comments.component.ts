import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import firestore from "firebase/app";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from 'src/app/services/auth/auth.service';


@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() docRef: string;
  @Input() postId: string;
  @Output() newCommentEvent = new EventEmitter<any>();
  comment:FormGroup;
  author: any;
  isMobile = localStorage.getItem('isMobile');

  constructor(
    public auth: AuthService,
    private afs: AngularFirestore,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    if (this.auth.userData) {
      this.author = this.auth.userData;
      this.comment = this.fb.group({
        answer: new FormControl({value: '', disabled: !this.auth.userData.is_completed}, [
          Validators.required,
          Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)
        ]),
        author: {
          fullname: this.author.fullname,
          image: this.author.imageURL,
          living_since: this.author.living_since,
          locality: this.author.locality,
          uid: this.author.uid,
          role: this.author.role
        },
        docRef: this.docRef,
        pId: this.postId,
        postedOn: firestore.firestore.Timestamp.now()
      });
    }
  }

  get answer() {
    return this.comment.get('answer');
  }

  async postComment() {
    const commentValue = this.comment.value;
    try {
      await this.afs.collection("comments").add(commentValue);
      console.log(commentValue);
      this.newCommentEvent.emit(commentValue);
      this.comment.get('answer').reset();
      this.comment.get('answer').clearValidators();
      this.comment.get('answer').updateValueAndValidity();
    } catch (error) {
      console.log(error);
    }
  }

}
