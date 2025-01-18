import { TestBed } from '@angular/core/testing';

import { ThreadDetailResolverService } from './thread-detail-resolver.service';

describe('ThreadDetailResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreadDetailResolverService = TestBed.get(ThreadDetailResolverService);
    expect(service).toBeTruthy();
  });
});
