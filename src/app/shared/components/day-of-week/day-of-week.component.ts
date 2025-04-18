import {Component, OnInit, Input, Type} from '@angular/core';


interface Hours {
  ini: string;
  end: string;
}

@Component({
  selector: 'day-of-week',
  templateUrl: './day-of-week.component.html',
  styleUrls: ['./day-of-week.component.scss']
})
export class DayOfWeekComponent implements OnInit {

  @Input('text') text: string;
  @Input('selected') selected: boolean;
  @Input('size') size: 'small' | 'normal' | 'big';
  @Input('hours') hours: Hours;

  constructor() {
  }

  ngOnInit() {
  }

}
