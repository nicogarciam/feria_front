import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiFeaturesService {

  constructor() { }

  /**
   * Detects features from an image file.
   * @param imageFile The image file to analyze.
   * @returns An Observable emitting an array of detected feature strings.
   */
  detectFeatures(imageFile: File): Observable<string[]> {
    // Mock implementation - replace with actual API call
    console.log('AiFeaturesService: detectFeatures called with file:', imageFile.name);
    const mockFeatures = ['Feature A from AI', 'Feature B from AI', 'Feature C from AI', 'Shiny', 'Red Color'];
    return of(mockFeatures);
  }
}
