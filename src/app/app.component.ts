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

    //let registeredStudents = [];

    let students: Student[] = [];

    let results = [];
    
    //this._api.getTypeRequest('ladok/api/students/'+courseCode+'/'+module).subscribe(async (res:any)=>{
      let registeredStudents: any = await this._api.getTypeRequest('ladok/api/students/'+courseCode+'/'+module).toPromise();
      //registeredStudents = res;
      console.dir(registeredStudents);

      for(let index=0; index<registeredStudents.length; index++){
        let studentID = registeredStudents[index];
        let student: any = await this._api.getTypeRequest('studentITS/api/students/'+studentID).toPromise();
        
          let name = student.namn;
          let civicNo = student.personnummer;
          let studentId = student.studentID;
          let newStudent = new Student(name, civicNo, studentId);
          //console.dir(newStudent);
          students.push(newStudent);
          console.dir(students);
      }
      console.dir(students);
      
      this._selectedStudents = students;

      console.dir(this._selectedStudents);
      //results = this.getResults(this._selectedStudents);
      for(let index=0; index<this._selectedStudents.length; index++){
        let studentCivicNo = this._selectedStudents[index].personnummer;
        console.log('civic: ', studentCivicNo);
        let res: any = await this._api.getTypeRequest('ladok/api/results/'+studentCivicNo).toPromise();
        //this._api.getTypeRequest('ladok/api/results/'+studentCivicNo).subscribe((res:any)=>{
          console.dir(res);
          //results = res;
          let name = this._selectedStudents[index].namn;
          let civicNo = this._selectedStudents[index].personnummer;
          let courseCode = this.selectedCourseCode;
          let module = this.selectedModule;
          let resultCanvas = "TBA";
          let newStudyResult = new Studyresult(name, civicNo, courseCode, module, resultCanvas);
          results.push(newStudyResult);
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
      //this._api.getTypeRequest('studentITS/api/students/'+studentID).subscribe((res:any)=>{   
        //let student = res;
        //console.dir(student);
        let name = student.namn;
        let civicNo = student.personnummer;
        let studentId = student.studentID;
        let newStudent = new Student(name, civicNo, studentId);
        //console.dir(newStudent);
        students.push(newStudent);
        console.dir(students);
        /*
        if(index===registeredStudents.length-1){
          this._selectedStudents = students;
          console.dir(this._selectedStudents);
          return this._selectedStudents;
        }*/
        /*
      }, err => {
        console.log(err);
      });*/
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
      //this._api.getTypeRequest('ladok/api/results/'+studentCivicNo).subscribe((res:any)=>{
        console.dir(res);
        //results = res;
        let name = students[index].namn;
        let civicNo = students[index].personnummer;
        let courseCode = this.selectedCourseCode;
        let module = this.selectedModule;
        let resultCanvas = "TBA";
        let newStudyResult = new Studyresult(name, civicNo, courseCode, module, resultCanvas);
        results.push(newStudyResult);
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

  constructor(namn: String, personnummer: String, kurskod: String, modul: String, resultCanvas: String){
    this.namn = namn;
    this.personnummer = personnummer;
    this.kurskod = kurskod;
    this.modul = modul;
    this.resultCanvas = resultCanvas;
  }

}