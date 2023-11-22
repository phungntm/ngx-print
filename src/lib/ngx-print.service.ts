import { Injectable } from "@angular/core";
import { IPrintOptions } from "./iprint-options";
import { PrintBase } from "./ngx-print.base";

@Injectable({
  providedIn: "root",
})
export class NgxPrintService extends PrintBase {

  public print(printOptions: IPrintOptions): void {
    // Call the print method in the parent class
    super.print(printOptions);
  }
}
