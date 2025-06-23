import { Component } from '@angular/core';

@Component({
  selector: 'app-data-import-svg',
  templateUrl: './data-import.component.svg',
  styleUrls: ['./data-import.component.css']
})
export class DataImportSvgComponent {
   fillColor = '#454745';

  changeColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    this.fillColor = `rgb(${r}, ${g}, ${b})`;
  }
}