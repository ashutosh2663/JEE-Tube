import subjects from "../../data/subjects";
import Card from "../common/Card";

export default function SubjectRow() {

return(

<section style={{marginTop:40}}>

<h2 style={{marginBottom:25}}>Continue Learning</h2>

<div
style={{
display:"flex",
gap:"22px",
overflowX:"auto",
paddingBottom:"15px"
}}
>

{

subjects.map(subject=>(

<Card

key={subject.id}

title={subject.title}

teacher={subject.teacher}

duration={subject.duration}

color={subject.color}

/>

))

}

</div>

</section>

);

}