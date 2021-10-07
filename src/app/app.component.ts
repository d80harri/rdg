import {
  Component,
  VERSION,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import * as gen from 'random-seed';
import { interval } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  team = [
    {
      name: 'Harald',
      image:
        'https://dev-jira.dynatrace.org/secure/useravatar?ownerId=harald.bittermann&avatarId=24825'
    },
    {
      name: 'Stefan',
      image:
        'https://dev-jira.dynatrace.org/secure/useravatar?ownerId=stefan.aufischer&avatarId=24303'
    },
    {
      name: 'Juergen',
      image:
        'https://dev-jira.dynatrace.org/secure/useravatar?ownerId=juergen.stuermer&avatarId=21405'
    },
    {
      name: 'Domink R.',
      image:
        'https://dev-jira.dynatrace.org/secure/useravatar?ownerId=dominik.reitberger&avatarId=23540'
    },
    /*{
      name: "Fouad",
      image:
        "https://dev-jira.dynatrace.org/secure/useravatar?ownerId=fouad.alkada&avatarId=23908"
    },*/
    {
      name: 'Dominik S.',
      image:
        'https://dev-jira.dynatrace.org/secure/useravatar?ownerId=cwat-dstadler&avatarId=19407'
    },
    {
      name: 'Richa',
      image:
        'https://dev-jira.dynatrace.org/secure/useravatar?ownerId=richa.budhraja'
    },
    {
      name: 'Roman',
      image:
        'https://dev-jira.dynatrace.org/secure/useravatar?ownerId=roman.merliuk'
    },
    {
      name: "Sebastian :'( :'( :'( :'(",
      image:
        'https://dev-jira.dynatrace.org/secure/useravatar?ownerId=sebastian.zarhuber'
    },
    {
      name: 'Ramez',
      image:
        'https://dev-jira.dynatrace.org/secure/useravatar?ownerId=ramez.elbaroudy'
    }
  ];

  readonly STATE = State;
  readonly MATH = Math;

  now: Date;
  todaysStandup: Standup;
  tomorrowStandup: Standup;
  randomizedList = this.team;
  randomizedListHistory: any[];
  viewHistory = false;
  percentageIndicator = new PercentageIndicator();

  @ViewChild('sequenceContainer') sequenceContainer: ElementRef;

  constructor(private http: HttpClient) {
    let now = new Date();
    this.randomizedList = this.getDailyOrderForDay(now);

    this.update();
    interval(1000).subscribe(x => {
      this.update();
    });

    this.randomizedListHistory = this.getRandomizedListHistory();
  }

  private getRandomizedListHistory(): any[] {
    const result = [];
    let date = new Date();

    for (let i = 0; i < 30; i++) {
      result[i] = {};
      result[i].date = date;
      result[i].randomizedList = this.getDailyOrderForDay(date);
      date = new Date(date.getTime() - 1000 * 60 * 60 * 24);
    }

    return result;
  }

  private update(): void {
    this.now = new Date();
    // uncomment the following lines to change current time for debugging
    /*this.now.setHours(9);
    this.now.setMinutes(0);
    this.now.setSeconds(1);*/

    this.updateIntervals();
    this.updatePercentageIndicator();
  }

  private updatePercentageIndicator(): void {
    if (this.sequenceContainer) {
      const bound = this.sequenceContainer.nativeElement.getBoundingClientRect();

      this.percentageIndicator.width = 10;

      this.percentageIndicator.topOffset =
        bound.top + window.pageYOffset ||
        this.sequenceContainer.nativeElement.scrollTop;
      this.percentageIndicator.leftOffset =
        bound.left - this.percentageIndicator.width - 3;

      const percent =
        1 -
        this.todaysStandup.secondsToEnd /
          this.todaysStandup.getSecondsDuration();
      console.log('percents', percent, this.todaysStandup.secondsToEnd);
      this.percentageIndicator.height = bound.height * percent;
    }
  }

  private updateIntervals(): void {
    let today = new Date(this.now.getTime());

    today.setHours(8);
    today.setMinutes(55);
    today.setSeconds(0);

    let tomorrow = new Date(today.getTime());
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.todaysStandup = new Standup(today, this.now);
    this.tomorrowStandup = new Standup(tomorrow, this.now);
  }

  get state(): State {
    return this.todaysStandup.state;
  }

  private getDailyOrder(randomizer: any): any[] {
    let result = [];
    let open = [...this.team];
    for (let i = 0; i < this.team.length; i++) {
      const idx = randomizer(open.length);
      result[i] = open[idx];
      open.splice(idx, 1);
    }

    return result;
  }

  private getDailyOrderForDay(date: Date): any[] {
    let randomizer = gen.create(
      date.getDate() + date.getMonth() * 31 + date.getFullYear() * 366
    );
    return this.getDailyOrder(randomizer);
  }
}

export enum State {
  CLOSED,
  PREPARED,
  OPEN,
  EXTENDED
}

export class Standup {
  secondsToStart: number;
  secondsToEnd: number;
  end: Date;

  constructor(public start: Date, public now: Date) {
    this.secondsToStart = (start.getTime() - now.getTime()) / 1000;
    this.end = new Date(this.start.getTime() + 20 * 60 * 1000);
    this.secondsToEnd = (this.end.getTime() - this.now.getTime()) / 1000;
  }

  get state(): State {
    if (this.now.getTime() < this.start.getTime() - 5 * 60 * 1000) {
      return State.CLOSED;
    } else if (this.now.getTime() < this.start.getTime()) {
      return State.PREPARED;
    } else {
      if (this.now.getTime() < this.end.getTime()) {
        return State.OPEN;
      } else if (this.now.getTime() < this.end.getTime() + 5 * 60 * 1000) {
        return State.EXTENDED;
      } else {
        return State.CLOSED;
      }
    }
  }

  getSecondsDuration() {
    return (this.end.getTime() - this.start.getTime()) / 1000;
  }
}

export class PullRequest {
  constructor(public title: string) {}
}

export class PercentageIndicator {
  topOffset = 0;
  leftOffset: number;
  width: number;
  height = 0;
}
