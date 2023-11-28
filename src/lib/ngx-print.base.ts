import { Injectable } from "@angular/core";
import { PrintOptions } from "./print-options";

@Injectable({
    providedIn: 'root'
})
export class PrintBase {

    private _printStyle: string[] = [];
    private _styleSheetFile: string = '';

    //#region Getters and Setters
    /**
     * Sets the print styles based on the provided values.
     *
     * @param {Object} values - Key-value pairs representing print styles.
     * @protected
     */
    protected setPrintStyle(values: { [key: string]: { [key: string]: string } }) {
        this._printStyle = [];
        for (let key in values) {
            if (values.hasOwnProperty(key)) {
                this._printStyle.push((key + JSON.stringify(values[key])).replace(/['"]+/g, ''));
            }
        }
    }

    /**
     *
     *
     * @returns the string that create the stylesheet which will be injected
     * later within <style></style> tag.
     *
     * -join/replace to transform an array objects to css-styled string
     */
    public returnStyleValues() {
        return `<style> ${this._printStyle.join(' ').replace(/,/g, ';')} </style>`;
    }

    /**
   * @returns string which contains the link tags containing the css which will
   * be injected later within <head></head> tag.
   *
   */
    private returnStyleSheetLinkTags() {
        return this._styleSheetFile;
    }

    /**
     * Sets the style sheet file based on the provided CSS list.
     *
     * @param {string} cssList - CSS file or list of CSS files.
     * @protected
     */
    protected setStyleSheetFile(cssList: string) {
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

    //#endregion

    //#region Private methods used by PrintBase

    /**
     * Updates the default values for input elements.
     *
     * @param {HTMLCollectionOf<HTMLInputElement>} elements - Collection of input elements.
     * @private
     */
    private updateInputDefaults(elements: HTMLCollectionOf<HTMLInputElement>): void {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            element['defaultValue'] = element.value;
            if (element['checked']) element['defaultChecked'] = true;
        }
    }

    /**
     * Updates the default values for select elements.
     *
     * @param {HTMLCollectionOf<HTMLSelectElement>} elements - Collection of select elements.
     * @private
     */
    private updateSelectDefaults(elements: HTMLCollectionOf<HTMLSelectElement>): void {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const selectedIdx = element.selectedIndex;
            const selectedOption: HTMLOptionElement = element.options[selectedIdx];

            selectedOption.defaultSelected = true;
        }
    }

    /**
     * Updates the default values for textarea elements.
     *
     * @param {HTMLCollectionOf<HTMLTextAreaElement>} elements - Collection of textarea elements.
     * @private
     */
    private updateTextAreaDefaults(elements: HTMLCollectionOf<HTMLTextAreaElement>): void {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            element['defaultValue'] = element.value;
        }
    }

    /**
     * Retrieves the HTML content of a specified printing section.
     *
     * @param {string} printSectionId - Id of the printing section.
     * @returns {string | null} - HTML content of the printing section, or null if not found.
     * @private
     */
    private getHtmlContents(printSectionId: string): string | null {
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

    /**
     * Retrieves the HTML content of elements with the specified tag.
     *
     * @param {keyof HTMLElementTagNameMap} tag - HTML tag name.
     * @returns {string} - Concatenated outerHTML of elements with the specified tag.
     * @private
     */
    private getElementTag(tag: keyof HTMLElementTagNameMap): string {
        const html: string[] = [];
        const elements = document.getElementsByTagName(tag);
        for (let index = 0; index < elements.length; index++) {
            html.push(elements[index].outerHTML);
        }
        return html.join('\r\n');
    }
    //#endregion


    /**
     * Prints the specified content using the provided print options.
     *
     * @param {PrintOptions} printOptions - Options for printing.
     * @public
     */
    protected print(printOptions: PrintOptions): void {

        let styles = '', links = '';
        const baseTag = this.getElementTag('base');

        if (printOptions.useExistingCss) {
            styles = this.getElementTag('style');
            links = this.getElementTag('link');
        }

        const printContents = this.getHtmlContents(printOptions.printSectionId);
        if (!printContents) {
            // Handle the case where the specified print section is not found.
            console.error(`Print section with id ${printOptions.printSectionId} not found.`);
            return;
        }

        const popupWin = window.open("", "_blank", "top=0,left=0,height=auto,width=auto");
        popupWin.document.open();
        popupWin.document.write(`
          <html>
            <head>
              <title>${printOptions.printTitle ? printOptions.printTitle : ""}</title>
              ${baseTag}
              ${this.returnStyleValues()}
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
