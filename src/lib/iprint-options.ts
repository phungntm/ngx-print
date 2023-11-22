export interface IPrintOptions {
    printSectionId: string;
    printTitle?: string;
    useExistingCss: boolean;
    bodyClass: string;
    previewOnly: boolean;
    closeWindow: boolean;
    printDelay: number;
  }