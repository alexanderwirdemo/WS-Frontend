import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from 'src/services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'WS-Frontend';

  searchModuleForm;
  selectedModuleForm;
  selectedModule: string;
  selectedOption;
  options = ['Välj modul', ' - '];
  selectedCourseCode: string;
  _selectedStudents: Array<Student>;
  _resultsToDisplay: Array<Studyresult>;
  _examDate: any;

  constructor
  (
    private formBuilder: FormBuilder,
    private _api: ApiService,
  
    ) 
    {
    this._selectedStudents = new Array<Student>();
    this._resultsToDisplay = new Array<Studyresult>();
    this.searchModuleForm = this.formBuilder.group({
      courseCode: '',
  });
  this.selectedModuleForm = this.formBuilder.group({
    selectedModule: '',
});
  }

  public get selectedStudents() {
    return this._selectedStudents;
}

public set selectedStudents(students: Array<Student>) {  
    this._selectedStudents = students;
}


  async getResultsView(){
    let moduleCode = this.selectedOption;
    let dashSign = moduleCode.indexOf(" - ");
    this.selectedModule = moduleCode.substring(0,dashSign);
    console.log('module: ',this.selectedModule);
    let courseCode = this.selectedCourseCode;
    let module = this.selectedModule;

    let students: Student[] = [];

    let results = [];
    
      let registeredStudents: any = await this._api.getTypeRequest('ladok/api/students/'+courseCode+'/'+module).toPromise();
      console.dir(registeredStudents);

      for(let index=0; index<registeredStudents.length; index++){
        let studentID = registeredStudents[index];
        let student: any = await this._api.getTypeRequest('studentITS/api/students/'+studentID).toPromise();

          console.dir(student);
          let name = student.namn;
          let civicNo = student.personnummer;
          let studentId = student.studentID;
          let newStudent = new Student(name, civicNo, studentId);
          students.push(newStudent);
          console.dir(students);
      }
      console.dir(students);
      
      this._selectedStudents = students;

      console.dir(this._selectedStudents);
      for(let index=0; index<this._selectedStudents.length; index++){
        let studentCivicNo = this._selectedStudents[index].personnummer;
        console.log('civic: ', studentCivicNo);
        let res: any = await this._api.getTypeRequest('ladok/api/results/'+studentCivicNo).toPromise();
          console.dir(res);
          for(let resultIndex=0; resultIndex<res.length; resultIndex++){
            console.log(res[resultIndex].kurskod,  this.selectedCourseCode);
            if(res[resultIndex].kurskod === this.selectedCourseCode) {
              console.log(res[resultIndex].betyg_canvas[this.selectedModule]);
              let name = this._selectedStudents[index].namn;
              let civicNo = this._selectedStudents[index].personnummer;
              let courseCode = this.selectedCourseCode;
              let module = this.selectedModule;
              let resultCanvas = res[resultIndex].betyg_canvas[this.selectedModule];
              let resultLadok = res[resultIndex].betyg_ladok[0].resultat;
              let examDate = res[resultIndex].betyg_ladok[0].examinationsdatum;
              let status = res[resultIndex].status;
              let information = res[resultIndex].information;
              let newStudyResult = new Studyresult(name, civicNo, courseCode, module, resultCanvas, resultLadok, examDate, status, information);
              results.push(newStudyResult);
            }
          }
          
      }
      this._resultsToDisplay = results;
      console.dir(this._resultsToDisplay);
  }

  async getStudents(registeredStudents: string[]): Promise<Array<Student>>{
    let students = [];
    console.log(registeredStudents.length);
    for(let index=0; index<registeredStudents.length; index++){
      let studentID = registeredStudents[index];
      let student: any = await this._api.getTypeRequest('studentITS/api/students/'+studentID).toPromise();
        let name = student.namn;
        let civicNo = student.personnummer;
        let studentId = student.studentID;
        let newStudent = new Student(name, civicNo, studentId);
        students.push(newStudent);
        console.dir(students);
    }
    this._selectedStudents = students;
    console.dir(this._selectedStudents);
    return this._selectedStudents;
    
  }

  async getResults(students: any[]): Promise<any[]>{
    console.dir(students);
    console.log(students.length);
    let results = [];
    for(let index=0; index<students.length; index++){
      let studentCivicNo = students[index].personnummer;
      console.log('civic: ', studentCivicNo);
      let res: any = await this._api.getTypeRequest('ladok/api/results/'+studentCivicNo).toPromise();
        console.dir(res);
        let name = students[index].namn;
        let civicNo = students[index].personnummer;
        let courseCode = this.selectedCourseCode;
        let module = this.selectedModule;
        let resultCanvas = "TBA";
    }
    return results;
  }

  getModule(){
    let courseCode = this.searchModuleForm.get('courseCode').value;
    console.log('code: ',courseCode);
    this.selectedCourseCode = courseCode;
    this._api.getTypeRequest('epok/api/modules/'+courseCode).subscribe((res:any)=>{
      console.dir(res);
      this.updateDropdownMenu(res);
    }, err => {
      console.log(err);
    });
  }

  get courseCode(): any {
    return this.searchModuleForm.get('courseCode');
  }
  
  updateDropdownMenu(res: any){
    let newOptions: string[] =['Välj modul', ' - '];
    for(let index=0; index<res.length; index++){
      let option = res[index].kod + " - " + res[index].benamning;
      newOptions[index+2] = option;
    }
    this.options = newOptions;
  }

  addResult(result: Studyresult){
    result.examinationsdatum = (<HTMLInputElement>document.getElementById("time")).value;
    result.resultLadok = (<HTMLInputElement>document.getElementById("grade")).value;
    console.dir(result);
    this._api.putTypeRequest('ladok/api/add/results', result).subscribe((res:any)=>{
      console.dir(res);
    }, err => {
      console.log(err);
    });
  }

}

export class Student{
  public namn: String;
  public personnummer: String;
  public studentID: String;

  constructor(namn: String, personnummer: String, studentId: String){
    this.namn = namn;
    this.personnummer = personnummer;
    this.studentID = studentId;
  }

}

export class Studyresult{
  public namn: String;
  public personnummer: String;
  public kurskod: String;
  public modul: String;
  public resultCanvas: String;
  public resultLadok: String;
  public examinationsdatum: String;
  public status: String;
  public information: String;

  constructor(namn: String, personnummer: String, kurskod: String, modul: String, resultCanvas: String, resultLadok: String, examinationsdatum: String, status: String, information: String){
    this.namn = namn;
    this.personnummer = personnummer;
    this.kurskod = kurskod;
    this.modul = modul;
    this.resultCanvas = resultCanvas;
    this.resultLadok = resultLadok;
    this.examinationsdatum = examinationsdatum;
    this.status = status;
    this.information = information;
  }

}