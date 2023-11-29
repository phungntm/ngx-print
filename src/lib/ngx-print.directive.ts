import { Directive, HostListener, Input } from '@angular/core';
@Directive({
  selector: "button[ngxPrint]",
  standalone: true
})
export class NgxPrintDirective {

  public _printStyle = [];

  /**
   * Prevents the print dialog from opening on the window
   *
   * @memberof NgxPrintDirective
   */
  @Input() previewOnly: boolean = false;

  /**
   *
   *
   * @memberof NgxPrintDirective
   */
  @Input() printSectionId: string;

  /**
   *
   *
   * @memberof NgxPrintDirective
   */
  @Input() printTitle: string;

  /**
   *
   *
   * @memberof NgxPrintDirective
   */
  @Input() useExistingCss = false;

  /**
   * A delay in milliseconds to force the print dialog to wait before opened. Default: 0
   *
   * @memberof NgxPrintDirective
   */
  @Input() printDelay: number = 0;

  /**
   * Whether to close the window after print() returns.
   *
   */
  @Input() closeWindow: boolean = true;

  /**
   * Class attribute to apply to the body element.
   *
   */
  @Input() bodyClass: string = '';

  /**
   *
   *
   * @memberof NgxPrintDirective
   */
  @Input()
  set printStyle(values: { [key: string]: { [key: string]: string } }) {
    for (let key in values) {
      if (values.hasOwnProperty(key)) {
        this._printStyle.push((key + JSON.stringify(values[key])).replace(/['"]+/g, ''));
      }
    }
    this.returnStyleValues();
  }

  /**
   *
   *
   * @returns the string that create the stylesheet which will be injected
   * later within <style></style> tag.
   *
   * -join/replace to transform an array objects to css-styled string
   *
   * @memberof NgxPrintDirective
   */
  public returnStyleValues() {
    return `<style> ${this._printStyle.join(' ').replace(/,/g, ';')} </style>`;
  }

  /**
   *
   *
   * @returns html for the given tag
   *
   * @memberof NgxPrintDirective
   */
  private _styleSheetFile = '';

  /**
   * @memberof NgxPrintDirective
   * @param cssList
   */
  @Input()
  set styleSheetFile(cssList: string) {
    let linkTagFn = function (cssFileName) {
      return `<link rel="stylesheet" type="text/css" href="${cssFileName}">`;
    }
    if (cssList.indexOf(',') !== -1) {
      const valueArr = cssList.split(',');
      for (let val of valueArr) {
        this._styleSheetFile = this._styleSheetFile + linkTagFn(val);
      }
    } else {
      this._styleSheetFile = linkTagFn(cssList);
    }
  }

  /**
   * @returns string which contains the link tags containing the css which will
   * be injected later within <head></head> tag.
   *
   */
  private returnStyleSheetLinkTags() {
    return this._styleSheetFile;
  }
  private getElementTag(tag: keyof HTMLElementTagNameMap): string {
    const html: string[] = [];
    const elements = document.getElementsByTagName(tag);
    for (let index = 0; index < elements.length; index++) {
      html.push(elements[index].outerHTML);
    }
    return html.join('\r\n');
  }

  /**
 *
 * @description When printing, the default option of form elements are printed.
 * Here we update what that default is to print the current values.
 *
 * @param elements the html element collection to save defaults to
 *
 */
  private updateInputDefaults(elements: HTMLCollectionOf<HTMLInputElement>): void {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      element['defaultValue'] = element.value;
      if (element['checked']) element['defaultChecked'] = true;
    }
  }
  private updateSelectDefaults(elements: HTMLCollectionOf<HTMLSelectElement>): void {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const selectedIdx = element.selectedIndex;
      const selectedOption: HTMLOptionElement = element.options[selectedIdx];

      selectedOption.defaultSelected = true;
    }
  }
  private updateTextAreaDefaults(elements: HTMLCollectionOf<HTMLTextAreaElement>): void {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      element['defaultValue'] = element.value;
    }
  }

  /**
   * @description Retrieves the html contents of the print section id.
   * Updates the html elements to default their form values to the current form values
   *
   * @returns {string | null} html section to be printed
   *
   */
  private getHtmlContents(): string | null {
    const printContents = document.getElementById(this.printSectionId);
    if (!printContents) return null;

    const inputEls = printContents.getElementsByTagName('input');
    const selectEls = printContents.getElementsByTagName('select');
    const textAreaEls = printContents.getElementsByTagName('textarea');

    this.updateInputDefaults(inputEls);
    this.updateSelectDefaults(selectEls);
    this.updateTextAreaDefaults(textAreaEls);

    return printContents.innerHTML;
  }

  /**
   *
   *
   * @memberof NgxPrintDirective
   */
  @HostListener('click')
  public print(): void {
    let printContents, popupWin, styles = '', links = '';
    const baseTag = this.getElementTag('base');

    if (this.useExistingCss) {
      styles = this.getElementTag('style');
      links = this.getElementTag('link');
    }

    printContents = this.getHtmlContents();
    popupWin = window.open("", "_blank", "top=0,left=0,height=auto,width=auto");
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>${this.printTitle ? this.printTitle : ""}</title>
          ${baseTag}
          ${this.returnStyleValues()}
          ${this.returnStyleSheetLinkTags()}
          ${styles}
          ${links}
        </head>
        <body ${this.bodyClass ? `class="${this.bodyClass}"` : ''}>
          ${printContents}
          <script defer>
            function triggerPrint(event) {
              window.removeEventListener('load', triggerPrint, false);
              ${this.previewOnly || !this.closeWindow ? '' : `setTimeout(function() {
                closeWindow(window.print());
              }, ${this.printDelay});`}
            }
            function closeWindow(){
              window.close();
            }
            window.addEventListener('load', triggerPrint, false);
          </script>
        </body>
      </html>`);
    popupWin.document.close();
  }
}
