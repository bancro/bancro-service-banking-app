import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivityTrailService } from './activity-trail.service';

describe('ActivityTrailService', () => {
  let service: ActivityTrailService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ActivityTrailService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the activity summary', () => {
    service.summary().subscribe();
    const request = http.expectOne('/bancro/activity/summary');
    expect(request.request.method).toBe('GET');
    request.flush({ today: 1 });
  });

  it('sends the complete activity filter set', () => {
    service.search({
      category: 'TELLER', action: 'COMMAND_APPROVED', status: 'SUCCESS',
      transactionReference: 'BNC-1', entityType: 'TELLER_COMMAND', entityId: 'abc',
      username: 'checker', userId: 42, mine: true, limit: 999
    }).subscribe();

    const request = http.expectOne(r => r.url === '/bancro/activity');
    expect(request.request.params.get('category')).toBe('TELLER');
    expect(request.request.params.get('action')).toBe('COMMAND_APPROVED');
    expect(request.request.params.get('status')).toBe('SUCCESS');
    expect(request.request.params.get('transactionReference')).toBe('BNC-1');
    expect(request.request.params.get('entityType')).toBe('TELLER_COMMAND');
    expect(request.request.params.get('entityId')).toBe('abc');
    expect(request.request.params.get('username')).toBe('checker');
    expect(request.request.params.get('userId')).toBe('42');
    expect(request.request.params.get('mine')).toBe('true');
    expect(request.request.params.get('limit')).toBe('999');
    request.flush([]);
  });
});
