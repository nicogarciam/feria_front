import {MatDateFormats, NativeDateAdapter} from '@angular/material/core';
import {Injectable} from '@angular/core';

@Injectable()
export class AppDateAdapter extends NativeDateAdapter {
    format(date: Date, displayFormat: Object): string {
        // console.log("AppDateAdapter", date);
        if (displayFormat === 'input') {
            let day: string = date.getDate().toString();
            day = +day < 10 ? '0' + day : day;
            let month: string = (date.getMonth() + 1).toString();
            month = +month < 10 ? '0' + month : month;
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return date.toDateString();
    }
}
export const APP_DATE_FORMATS: MatDateFormats = {
    parse: {
        dateInput: { month: 'numeric', year: 'numeric', day: 'numeric' },
},
display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric'
    },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
}
};
