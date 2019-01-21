import {NgModule} from '@angular/core';
import {NgmGridComponent} from './ngm-grid.component';
import {NgmBaseModule} from 'ngm-base';
import {DataTablesModule} from 'angular-datatables';

@NgModule({
    declarations: [NgmGridComponent],
    imports: [
        NgmBaseModule,
        DataTablesModule,
    ],
    exports: [NgmGridComponent]
})
export class NgmGridModule {
}
