import { Component, OnInit } from '@angular/core';
import {NavController, AlertController} from '@ionic/angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router , ActivatedRoute} from '@angular/router';
import * as firebase from 'firebase';
import { Storage } from '@ionic/storage';
import { from } from 'rxjs';

@Component({
  selector: 'app-post',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
})
export class PostPage implements OnInit {
// 글 보여주기 위한 변수들
  temp: any;
  public item: any;
  code: string;
  writer: string;
  headert: string;
  public itemtmp: any;
// 채팅에 필요한 변수들
  check = false;
  chattingRef: any;
  getuid1: string;
  getuid2: string;
  size: number;
  index: number;
  first = true;
  getSize: any;
  currentU: string;
  name: string;
  user1Pic;
  user2Pic;
  tmpPic;

  writergu:string;
  writerdong:string;
  constructor(
    public navCtrl: NavController,
    public atrCtrl: AlertController,
    public db: AngularFireDatabase,
    public fs: AngularFirestore,
    public af: AngularFireAuth,
    public router: Router,
    public stor: Storage,
    public activatedRoute: ActivatedRoute
  ) {
    this.stor.get('id').then((val) => {
      this.currentU = val;
    });
   }

   ngOnInit() {
    this.code = this.activatedRoute.snapshot.paramMap.get('code');
    this.writer = this.activatedRoute.snapshot.paramMap.get('writer');
    this.load();
    this.stor.get('id').then((val) => {
      this.currentU = val;
    });
    firebase.database().ref().once('value').then((snapshot) => {
            // tslint:disable-next-line: prefer-const
                let c = snapshot.child(`regisTxt/${this.code}/userid`).val();  //id
                this.name = c;
    });
  }
  async alertDelete(){
    const alert = await this.atrCtrl.create({
      header:'알림',
      message: '글이 삭제되었습니다.',
      buttons:[
        {
          text:'확인',
          role:'cancel',
          handler:(blah)=>{
            console.log('글 삭제');
            this.router.navigateByUrl('tabs/tab1');
          }
        }
      ]
    });
    await alert.present();
  }

  async delete(){ 

    const al = await this.atrCtrl.create({
      header:'알림',
      message: '글을 삭제 하시겠습니까?',
      buttons:[
        {
          text:'아니오',
          role:'cancel',
          cssClass:'secondary',
          handler:(blah)=>{
          }
        },
        {
          text:'네',
          handler:()=>{
            firebase.database().ref().once('value').then((snapshot) => {
              this.db.object(`regisTxt/${this.code}`).set(null);
            });
              this.alertDelete();
            }
          }
      ]
    });
    await al.present();

  }

  load() {
    this.db.list('regisTxt/', ref => ref.orderByChild('code').equalTo(this.code)).valueChanges().subscribe(
      data => {
        if (data.length !== 1) { return; } // TODO: Error exception
        this.item = data;
        this.itemtmp = data[0];
        if (this.itemtmp.category === 'help') {
          this.headert = '위탁';
        } else {
          this.headert = '분양';
        }
        this.db.list('userInfo/', ref => ref.orderByChild('userid').equalTo(this.writer)).valueChanges().subscribe(
          // tslint:disable-next-line:no-shadowed-variable
          data => {
            if (data.length !== 1) { return; } // TODO: Error exception
            let writerInfo;
            writerInfo = data[0]; // 변수명 왜이래ㅋㅋ큐ㅠㅠㅠ
            this.writergu=writerInfo.usergu;
            this.writerdong=writerInfo.userdong;
            document.getElementById('writerimg').setAttribute('src', writerInfo.userpic);
        });
    });
  }
  async chat2Me() {
    const alert2 = await this.atrCtrl.create({
      header: '경고!',
      message: '본인이 작성한 게시글입니다',
      buttons: [
        {
          text: '확인',
          role: 'cancel',
          handler: (blah) => {
            console.log('나랑 채팅');
          }
        }
      ]
    });
    await alert2.present();
  }
  async havetoLogin(){
    const alert3=await this.atrCtrl.create({
      header:'알림',
      message:'로그인 후 이용해 주세요',
      buttons:[{
        text:'확인',
        role:'cancel'
      }]
    });
    await alert3.present();
  }
  async cannotChat(){
    const alert4=await this.atrCtrl.create({
      header: '알림',
      message: '탈퇴한 회원 입니다.',
      buttons: [{
        text: '확인',
        role: 'cancel'
      }]
    });
    await alert4.present();
  }
  async gotoChat(you: string) {
    console.log(you);
    if(this.currentU==null){
      this.havetoLogin();
    } else if(you == '(알수없음)') {
      this.cannotChat();
    } else {
      this.check = false;
      const alert = await this.atrCtrl.create({
          header: '확인!',
          message: '<strong>' + you + '</strong>' + '와 채팅하시겠습니까??',
          buttons: [
            {
              text: '취소',
              role: 'cancel',
              cssClass: 'secondary',
              handler: (blah) => {
                console.log('Confirm Cancel: blah');
              }
            }, {
              text: '확인',
              handler: () => {
                console.log('Confirm Okay');
                console.log("현재 User: "+this.currentU);
                const tmp1 = this.currentU;
                const tmp2 = you;
  
                firebase.database().ref().once('value').then((snapshot)=>{
                  this.db.list('userInfo/',ref=>ref.orderByChild('userid').equalTo(this.currentU)).valueChanges().subscribe(
                    data=>{
                      this.tmpPic=data[0];
                      this.user1Pic=(this.tmpPic.userpic).toString();
                     console.log("user1"+this.user1Pic);
                    });
                });
  
                firebase.database().ref().once('value').then((snapshot)=>{
                  this.db.list('userInfo/',ref=>ref.orderByChild('userid').equalTo(you)).valueChanges().subscribe(
                    data=>{
                      this.tmpPic=data[0];
                      this.user2Pic=(this.tmpPic.userpic).toString();
                     console.log("user2+"+this.user2Pic);
                    });
                });
                
                if ( tmp1 === tmp2 ) {
                  this.chat2Me();
                } else {
                  this.chattingRef = this.fs.collection('chatting', ref => ref.orderBy('Timestamp')).valueChanges();
                  const db = firebase.firestore();
                  const collection = db.collection('chatting');
  
                  collection.get().then(snapshot => {
                    snapshot.forEach(doc => {
                      const get1 = doc.data().uid1;
                      const get2 = doc.data().uid2;
                      this.getuid1 = get1;
                      this.getuid2 = get2;
                      if ((tmp1 === this.getuid1 && tmp2 === this.getuid2) || (tmp1 === this.getuid2 && tmp2 === this.getuid1)) {
                        this.check = true;
                      }
                    });
                    if (this.check === false) {
                      this.size = snapshot.size;
                      /// this.currentU와 you의 프로필 사진 찾기
  
                      if (this.size === 0) { // 채팅 목록이 한개도 없음
                        this.index = 0;
                        this.fs.collection('ListSize').doc('index').set({
                          index: this.index
                        });
                        console.log("채팅방 만들기 전 :"+this.user1Pic);
                        this.fs.collection('chatting').doc((this.index).toString()).set({
                          uid1: this.currentU,
                          uid2: you,
                          uid1Pic: this.user1Pic,
                          uid2Pic:this.user2Pic,
                          Timestamp: firebase.firestore.FieldValue.serverTimestamp(), // uid1, uid2의 프로필 사진도 같이 저장하자
                          num: this.index
                        });
                      } else { // 채팅 목록이 1개이상 존재할 때
                        // tslint:disable-next-line:no-shadowed-variable
                        db.collection('ListSize').get().then( snapshot => {
                          snapshot.forEach(doc => {
                            this.getSize = doc.data().index;
                            this.index = this.getSize;
                            this.index = this.index + 1;
                            this.fs.collection('chatting').doc((this.index).toString()).set({
                              uid1: this.currentU,
                              uid2: you,
                              uid1Pic: this.user1Pic,
                              uid2Pic: this.user2Pic,
                              Timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                              num: this.index
                            });
                            this.fs.collection('ListSize').doc('index').set({
                              index: this.index
                            });
                          });
                        });
                      }
                      console.log('new chatting list');
                    }
                  });
                  this.router.navigate(['chat-view', you]);
                  }
              }
            }
          ]
      });
      await alert.present();
    }
    
  }
}
