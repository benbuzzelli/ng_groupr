import { Injectable } from '@angular/core';
import {formatDate} from '@angular/common';

export class Message {
  sender: string;
  value: string;
  timestamp: string;

  constructor(sender, value, timestamp) {
    this.sender = sender;
    this.value = value;
    this.timestamp = timestamp;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }

  getMessage(sender, value) {
    let date = formatDate(new Date(), 'hh:mm:ss', 'en');
    console.log(date)
    return new Message(sender, value, date);
  }
}
