import { TestBed } from '@angular/core/testing';

import { NgxPrintService } from './ngx-print.service';

describe('NgxPrintService', () => {
  let service: NgxPrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
