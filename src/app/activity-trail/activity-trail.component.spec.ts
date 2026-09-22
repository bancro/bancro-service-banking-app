import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { ActivityTrailComponent } from './activity-trail.component';

describe('ActivityTrailComponent', () => {
  const service: any = {
    summary: jasmine.createSpy('summary').and.returnValue(of({ today: 2 })),
    search: jasmine.createSpy('search').and.returnValue(of([]))
  };

  beforeEach(() => {
    service.summary.calls.reset();
    service.search.calls.reset();
  });

  it('exposes the complete documented filter set', () => {
    const component = new ActivityTrailComponent(new FormBuilder(), service);
    ['category', 'action', 'status', 'transactionReference', 'entityType', 'entityId', 'username', 'mine', 'limit']
      .forEach(name => expect(component.filterForm.get(name)).toBeTruthy());
  });

  it('resets filters and refreshes the trail', () => {
    const component = new ActivityTrailComponent(new FormBuilder(), service);
    component.filterForm.patchValue({ category: 'TELLER', action: 'COMMAND_APPROVED', username: 'checker', mine: true, limit: 500 });
    component.reset();
    expect(component.filterForm.value).toEqual(jasmine.objectContaining({
      category: '', action: '', status: '', transactionReference: '', entityType: '', entityId: '', username: '', mine: false, limit: 150
    }));
    expect(service.summary).toHaveBeenCalled();
    expect(service.search).toHaveBeenCalled();
  });
});
