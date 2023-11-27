import { Injectable } from "@angular/core";
import { PrintOptions } from "./print-options";

@Injectable({
    providedIn: 'root'
})
export class PrintBase {

    private _printStyle: string[] = [];
    private _styleSheetFile: string = '';

    protected setPrintStyle(values: { [key: string]: { [key: string]: string } }): void {
        this._printStyle = [];
        for (let key in values) {
            if (values.hasOwnProperty(key)) {
                this._printStyle.push((key + JSON.stringify(values[key])).replace(/['"]+/g, ''));
            }
        }
    }

    protected setStyleSheetFile(cssList: string): void {
        let linkTagFn = function (cssFileName) {
            return `<link rel="stylesheet" type="text/css" href="${cssFileName}">`;
        };

        if (cssList.indexOf(',') !== -1) {
            const valueArr = cssList.split(',');
            this._styleSheetFile = valueArr.map(val => linkTagFn(val)).join('');
        } else {
            this._styleSheetFile = linkTagFn(cssList);
        }
    }

    protected updateInputDefaults(elements: HTMLCollectionOf<HTMLInputElement>): void {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            element['defaultValue'] = element.value;
            if (element['checked']) element['defaultChecked'] = true;
        }
    }

    protected updateSelectDefaults(elements: HTMLCollectionOf<HTMLSelectElement>): void {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const selectedIdx = element.selectedIndex;
            const selectedOption: HTMLOptionElement = element.options[selectedIdx];

            selectedOption.defaultSelected = true;
        }
    }

    protected updateTextAreaDefaults(elements: HTMLCollectionOf<HTMLTextAreaElement>): void {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            element['defaultValue'] = element.value;
        }
    }

    protected getHtmlContents(printSectionId: string): string | null {
        const printContents = document.getElementById(printSectionId);
        if (!printContents) return null;

        const inputEls = printContents.getElementsByTagName('input');
        const selectEls = printContents.getElementsByTagName('select');
        const textAreaEls = printContents.getElementsByTagName('textarea');

        this.updateInputDefaults(inputEls);
        this.updateSelectDefaults(selectEls);
        this.updateTextAreaDefaults(textAreaEls);

        return printContents.innerHTML;
    }

    protected getElementTag(tag: keyof HTMLElementTagNameMap): string {
        const html: string[] = [];
        const elements = document.getElementsByTagName(tag);
        for (let index = 0; index < elements.length; index++) {
            html.push(elements[index].outerHTML);
        }
        return html.join('\r\n');
    }

    /**
    * @returns string which contains the link tags containing the css which will
    * be injected later within <head></head> tag.
    *
    */
    protected returnStyleSheetLinkTags() {
        return this._styleSheetFile;
    }

    public print(printOptions: PrintOptions): void {

        let printContents, popupWin, styles = '', links = '';
        const baseTag = this.getElementTag('base');

        if (printOptions.useExistingCss) {
            styles = this.getElementTag('style');
            links = this.getElementTag('link');
        }

        printContents = this.getHtmlContents(printOptions.printSectionId);
        popupWin = window.open("", "_blank", "top=0,left=0,height=auto,width=auto");
        popupWin.document.open();
        popupWin.document.write(`
          <html>
            <head>
              <title>${printOptions.printTitle ? printOptions.printTitle : ""}</title>
              ${baseTag}
              <style>${this._printStyle.join(' ').replace(/,/g, ';')}</style>
              ${this.returnStyleSheetLinkTags()}
              ${styles}
              ${links}
            </head>
            <body ${printOptions.bodyClass ? `class="${printOptions.bodyClass}"` : ''}>
              ${printContents}
              <script defer>
                function triggerPrint(event) {
                  window.removeEventListener('load', triggerPrint, false);
                  ${printOptions.previewOnly || !printOptions.closeWindow ? '' : `setTimeout(function() {
                    closeWindow(window.print());
                  }, ${printOptions.printDelay});`}
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
