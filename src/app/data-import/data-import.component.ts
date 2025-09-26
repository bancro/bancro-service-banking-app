import { Component, OnInit } from "@angular/core";
import { AlertService } from "app/core/alert/alert.service";
import { ExternalApisService } from "app/external-apis/external-apis.service";

// Define an interface for the Data Type object to improve type safety
interface DataType {
  name: string;
  note: string;
  note1?: string;
  legalFormId: number | null;
  legalFormIdPlaceholder: string;
  template: string;
  apiUrl: string;
}

@Component({
  selector: "mifosx-app-data-import",
  templateUrl: "./data-import.component.html",
  styleUrls: ["./data-import.component.scss"],
})
export class DataImportComponent implements OnInit {
  selectedFile: File | null = null;
  legalFormId: number | null = null;
  selectedDataType: DataType | null = null;
  loading: boolean = false;
  successMessage: string = "";
  failureMessage: string = "";
  errorList: string[] = [];

  // Data types with their corresponding notes and Legal Form ID placeholders
  dataTypes: DataType[] = [
    {
      name: "Bancro Person Customer",
      note: "Legal Form ID should be 1 for Customer Data.",
      legalFormId: 1,
      legalFormIdPlaceholder: "Enter Legal Form ID for Customer Data",
      template: "assets/templates/Bancro_Person_Customer_Data_Import_Template.xlsx",
      apiUrl: "import-clients-cowry",
    },
    {
      name: "Bancro Staff Data Import",
      note: "",
      legalFormId: null,
      legalFormIdPlaceholder: "Enter Legal Form ID for Transaction Data",
      template: "assets/templates/Bancro_Staff_Data_Import_Template.xlsx",
      apiUrl: "import-staffs",
    },
    {
      name: "Bancro Entity Customer Data Import",
      note: "Legal Form ID should be 2 for Account Data.",
      legalFormId: 2,
      legalFormIdPlaceholder: "Enter Legal Form ID for Account Data",
      template: "assets/templates/Bancro_Entity_Customer_Data_Import_Template.xlsx",
      apiUrl: "import-entity-cowry",
    },
    {
      name: "Bancro GL Account Import",
      note: "Account Type: 1 = Asset, 2 = Liability, 3 = Equity, 4 = Income, 5 = Expense ",
      note1: " Account Usage: 1 = Detail, 2 = Header",
      legalFormId: null,
      legalFormIdPlaceholder: "Enter Legal Form ID for Account Data",
      template: "assets/templates/Bancro_GL_Account_Import_Template.xlsx",
      apiUrl: "import-glaccounts",
    },
    {
      name: "Bancro Fixed Deposit Account Import",
      note: "Deposit Frequency ID: 0 = Days, 1 = Week, 2 = Months, 3 = Years.",
      note1:
        "Deposit Period: This is the count that accompanies the frequency set. E.g. If you put 30 in the period field and set 1 in the frequency ID, it means the FD account is for 30 days",
      legalFormId: null,
      legalFormIdPlaceholder: "Enter Legal Form ID for Account Data",
      template: "assets/templates/Bancro_Fixed_Deposit_Account_Import_Template.xlsx",
      apiUrl: "import-fixeddeposit",
    },
    // Add other data types here
  ];

  constructor(
    private externalApisService: ExternalApisService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    // Initialize the first data type by default
    this.selectedDataType = this.dataTypes[0];
    this.legalFormId = this.selectedDataType.legalFormId;
  }

  // Called when a data type is selected from the dropdown
  onDataTypeChange(): void {
    this.legalFormId = this.selectedDataType?.legalFormId || null;
  }

  // Function to handle file change event
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
    this.successMessage = ""
    this.failureMessage = ""
  }

  // Function to handle template download
  downloadTemplate(): void {
    const link = document.createElement("a");
    link.href = this.selectedDataType?.template;
    link.download = `${this.selectedDataType?.name.replace(/ /g, "_")}.xlsx`;
    link.click();
  }

  // Reset input fields
  resetInput(): void {
    this.selectedFile = null;
    this.legalFormId = null;
    this.selectedDataType = this.dataTypes[0];
    this.loading = false;
    this.successMessage = ""
    this.failureMessage = ""
  }

  // Function to handle data submission
  submitData(): void {
    if (this.selectedFile && this.legalFormId === this.selectedDataType?.legalFormId) {
      this.loading = true;
      this.externalApisService.importData(this.selectedFile, this.selectedDataType.apiUrl).subscribe(
        (response: any) => {
          this.loading = false;
          const parsedResponse = JSON.parse(response);
          if (parsedResponse?.Success === false) {
            this.showFailureMessage(parsedResponse.Errors || []);
          }
          if (parsedResponse?.Success === true) {
            this.showSuccessMessage(parsedResponse.Message, parsedResponse.UploadedRecords);
          }
        },
        (error) => {
          this.loading = false;
          this.showFailureMessage(["An unexpected error occurred. Please try again."]);
          console.error("API Error:", error);
        },
      );
    } else {
      this.loading = false;
      console.error("Invalid Legal Form ID or No File Selected");
      this.showFailureMessage(["Please select a file and ensure the Legal Form ID is valid."]);
    }
  }

  // Handle success message
  showSuccessMessage(message: string, uploadedRecords: number): void {
    this.successMessage = `${message} ${uploadedRecords} records were uploaded successfully.`;
    this.failureMessage = "";
  }

  // Handle failure message
  showFailureMessage(errors: string[]): void {
    this.failureMessage = "Errors occurred during upload:";
    this.errorList = errors;
    this.successMessage = "";
  }
}
