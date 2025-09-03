import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Whoami } from './whoami';

describe('Whoami', () => {
  let component: Whoami;
  let fixture: ComponentFixture<Whoami>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Whoami]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Whoami);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
