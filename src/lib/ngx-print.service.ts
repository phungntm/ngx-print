import { Injectable } from "@angular/core";
import { PrintBase } from "./ngx-print.base";
import { PrintOptions } from "./print-options";

@Injectable({
  providedIn: "root",
})
export class NgxPrintService extends PrintBase {

  public print(printOptions: PrintOptions): void {
    // Call the print method in the parent class
    super.print(printOptions);
  }
}
