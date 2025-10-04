import { TestBed } from '@angular/core/testing';

import { JwtDecoderServiceService } from './jwt-decoder-service.service';

describe('JwtDecoderServiceService', () => {
  let service: JwtDecoderServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtDecoderServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
