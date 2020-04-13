import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import {formatDate} from '@angular/common';
import { UserService, User } from '../user/user.service';
import { Group } from '../group/group.service';
import { firestore } from 'firebase';

export class Message {
  user: User;
  value: string;
  previousUser: string;
  prevTimestamp: string;
  previousDate: MessageDate;
  timestamp: string;
  date: MessageDate;

  constructor(user, value, timestamp, ampmTime, previousDate, date, day, dayCount, month, previousUser, prevTimestamp) {
    this.user = user;
    this.value = value;
    this.timestamp = timestamp;
    this.prevTimestamp = prevTimestamp;
    this.previousDate = previousDate;
    this.date = new MessageDate(date, day, dayCount, month, ampmTime);
    this.previousUser = previousUser;
  }
}

export class MessageDate {
  date: string;
  day: string;
  dayCount: string;
  month: string;
  ampmTime: string;

  constructor(date, day, dayCount, month, ampmTime) {
    this.date = date;
    this.day = day;
    this.dayCount = dayCount;
    this.month = month;
    this.ampmTime = ampmTime;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  monthNames: string[] = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  dayNames: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  constructor(private userService: UserService,private afs: AngularFirestore) { }

  getMessage(user, value, previousDate, previousUser, prevTimestamp) {
    let date = new Date();
    var day = date.getDay();
    var dayCount = formatDate(new Date(), 'dd', 'en');
    var month = date.getMonth();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    let min = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + min + ' ' + ampm;
    let timestamp = formatDate(new Date(), 'dd/MM/yyyy-hh:mm:ss', 'en');
    let dateString = formatDate(new Date(), 'dd/MM/yyyy', 'en');
    return new Message(user, value, timestamp, strTime, previousDate, dateString, day, dayCount, month, previousUser, prevTimestamp);
  }

  addMessage(value, id, previousMessage, previousUser, prevTimestamp) {
    if (value === '')
      return;
    let user = this.userService.user;
    let message = this.getMessage(user, value, previousMessage, previousUser, prevTimestamp);
    this.getDividerString(message);
    this.afs.collection<Group>('groups').doc(id).update({messages: firestore.FieldValue.arrayUnion(JSON.parse(JSON.stringify(message)))});
  }

  getDateSubstring(message) {
    return message.date.ampmTime.substring(message.date.length-7, message.date.length);
  }

  getDisplayTime(message: Message) {
    let date = this.getDateSubstring(message);
    if (message.previousDate === undefined || message.previousDate === null)
      return date;
    if (message.user.id != message.previousUser)
      return date;
    if (message.date.date != message.previousDate.date)
      return date;
    let l = message.timestamp.length;
    console.log(message.previousUser)
    let minute = Number.parseInt(message.timestamp.substring(l-5, l-3));
    let prevMin = Number.parseInt(message.prevTimestamp.substring(l-5, l-3));
    if (Math.abs(minute - prevMin) > 1) {
      return date;
    }
    return '';
  }

  getDisplayName(message: Message) {
    if (message.previousUser === undefined || message.previousUser === null || message.previousUser === '')
      return message.user.displayName;
    if (message.user.id != message.previousUser)
      return message.user.displayName;
    if (message.date.date != message.previousDate.date)
      return message.user.displayName;
    let l = message.timestamp.length;
    let minute = Number.parseInt(message.timestamp.substring(l-5, l-3));
    let prevMin = Number.parseInt(message.prevTimestamp.substring(l-5, l-3));
    if (Math.abs(minute - prevMin) > 1) {
      return message.user.displayName;
    }
    return '';
  }

  getDividerString(m: Message) {
    let curDate = new Date();
    let cur = formatDate(curDate, 'dd/MM/yyyy', 'en');
    if (m.previousDate === null || m.previousDate === undefined) {
      if (cur === m.date.date)
        return 'Today';
    } else if (cur === m.date.date && m.date.date != m.previousDate.date)
      return 'Today';
    else if (m.date.date === m.previousDate.date) {
      return '';
    }
    let suffix = "st";
    let c: string = '';
    if (m.date.dayCount === '02') suffix = "nd";
    else if (m.date.dayCount === '03') suffix = "rd";
    else if (m.date.dayCount != '01') suffix = "th";
    if (Number.parseInt(m.date.dayCount) < 10)
      c = m.date.dayCount.substring(1, 2);
    else
      c = m.date.dayCount.substring(0, 2);
    let day = m.date.day;
    let month = m.date.month;
    let displayDate = this.monthNames[month] + " " + c + suffix + ", " + m.date.date.substring(6, 10);
    return displayDate;
  }
}
