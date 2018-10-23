import { Component, OnInit, ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, scan, mergeMap, throttleTime } from 'rxjs/operators';

const batchSize = 20;

@Component({
  selector: 'app-infinite-scroll',
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.css']
})
export class InfiniteScrollComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport)
  viewPort: CdkVirtualScrollViewport;
  theEnd = false;
  offset = new BehaviorSubject(null);
  infinite: Observable<any[]>;
  constructor(private db: AngularFirestore) {
    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap(n => this.getBatch(n)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );
    this.infinite = batchMap.pipe(map(v => Object.values(v)));
  }

  ngOnInit() {
  }

  nextBatch(e, offset) {
    if (this.theEnd) {
      return;
    }
    const end = this.viewPort.getRenderedRange().end;
    const total = this.viewPort.getDataLength();
    if (end === total) {
      this.offset.next(offset);
    }
  }

  trackByIdx(i) {
    return i;
  }

  getBatch(lastSeen: string) {
    return this.db
      .collection('people', ref => {
        return ref.orderBy('name')
          .startAfter(lastSeen)
          .limit(batchSize);
      })
      .snapshotChanges()
      .pipe(
        tap(arr => (arr.length ? null : this.theEnd = true)),
        map(arr => {
          return arr.reduce((acc, cur) => {
            const id = cur.payload.doc.id;
            const data = cur.payload.doc.data();
            return { ...acc, [id]: data };
          }, {});
        })
      );
  }

}
