import { TestBed } from '@angular/core/testing';

import { DeepSeekService } from './deep-seek.service';

describe('DeepSeekService', () => {
  let service: DeepSeekService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeepSeekService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
