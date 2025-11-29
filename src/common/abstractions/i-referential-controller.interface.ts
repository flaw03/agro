import { Observable } from 'rxjs';
import { IController } from './i-controller.interface';

export interface IReferentialController<Dto> extends IController<Dto, Dto, Partial<Dto>> {
  getAllActive(): Observable<Dto[]>;

  getAllReferentials(activeOnly?: boolean): Observable<Dto[]>;

  getByCode(code: string): Observable<Dto | null>;

  activateReferential(id: string | number): Observable<Dto>;

  deactivateReferential(id: string | number): Observable<Dto>;
}
