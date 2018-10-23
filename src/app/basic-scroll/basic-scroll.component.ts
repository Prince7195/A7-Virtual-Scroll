import { Component, OnInit } from '@angular/core';
import { emojiRandom } from '../emojies';
import * as faker from 'faker';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Component({
  selector: 'app-basic-scroll',
  templateUrl: './basic-scroll.component.html',
  styleUrls: ['./basic-scroll.component.css']
})
export class BasicScrollComponent implements OnInit {
  people;
  peopleDB: AngularFirestoreCollection<any[]>;
  constructor(private db: AngularFirestore) {
    this.peopleDB = db.collection('people');
    this.people = Array(100)
      .fill(1)
      .map(_ => {
        return {
          name: faker.name.findName(),
          bio: faker.hacker.phrase(),
          emoji: emojiRandom()
        };
      });
  }

  ngOnInit() {
  }

  insert() {
    this.people.forEach(person => {
      this.peopleDB.add(person);
    });
  }

}
