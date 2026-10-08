import React from "react";
const poses=[
[[60,72],[151,83],[80,153],[134,153]],
[[82,29],[133,30],[86,153],[139,150]],
[[70,99],[147,99],[125,145],[153,151]],
[[162,79],[175,81],[88,154],[129,154]],
[[68,101],[148,101],[88,155],[129,155]],
[[69,112],[145,112],[87,155],[128,155]],
[[75,95],[144,94],[92,156],[146,136]],
[[68,110],[148,110],[129,139],[161,140]],
[[75,103],[144,103],[85,149],[143,149]],
[[64,56],[142,98],[89,156],[130,155]],
[[67,95],[148,91],[89,154],[145,141]],
[[70,100],[150,100],[91,155],[127,155]],
[[70,101],[149,92],[97,155],[127,155]],
[[71,109],[144,84],[81,155],[147,147]],
[[70,99],[146,98],[91,154],[127,155]],
[[69,107],[145,105],[127,147],[153,155]],
[[70,109],[143,108],[134,145],[154,155]],
[[77,100],[137,99],[93,155],[126,155]]
];
export default function ExerciseIllustration({item,phase=0}){
 const [id,name,subtitle,materials,tone,accent]=item;
 const idx=Math.max(0,["tai","yoga","chair","wall","bands","strength","step","bed","floor","stretch","warmup","mobility","balance","walk","neck","back","legs","cool"].indexOf(id));
 const [left,right,footL,footR]=poses[idx];
 const offset=phase?9:0;
 const seat=["chair","back","legs","neck","cool"].includes(id);
 const bed=id==="bed";
 const x=seat?99:107;
 return <svg viewBox="0 0 220 175" role="img" aria-label={"Ilustración de "+name} preserveAspectRatio="xMidYMid meet">
 <rect width="220" height="175" rx="17" fill={tone}/>
 <circle cx="183" cy="28" r="25" fill="#fff" opacity=".65"/>
 <path d="M0 161 Q110 149 220 161 V175 H0Z" fill="#9dd0b1" opacity=".5"/>
 {seat&&<path d="M64 83 V141 H157 M64 123 H157 M79 141 V163 M146 141 V163" fill="none" stroke="#ab7857" strokeWidth="6" strokeLinecap="round"/>}
 {bed&&<rect x="40" y="126" width="149" height="21" rx="6" fill="#bda7d8"/>}
 {id==="wall"&&<path d="M184 12 V164" stroke="#a0c2d7" strokeWidth="7" strokeDasharray="9 7"/>}
 {id==="step"&&<path d="M122 160 V137 H188 V160" fill="#d5b9a3" stroke="#ad9078" strokeWidth="3"/>}
 {["floor","yoga","stretch"].includes(id)&&<ellipse cx="109" cy="159" rx="82" ry="9" fill="#8fbbb2"/>}
 <g fill="none" stroke="#446d69" strokeWidth="9" strokeLinecap="round">
 <path d={"M"+x+" 109 L"+(footL[0]-offset/3)+" "+footL[1]+" M"+x+" 109 L"+(footR[0]+offset/3)+" "+footR[1]}/>
 <path d={"M"+x+" 80 L"+(left[0]-offset)+" "+(left[1]-offset)+" M"+x+" 80 L"+(right[0]+offset)+" "+(right[1]-offset)}/>
 </g>
 <path d={"M"+x+" 79 Q"+(x+5)+" 95 "+x+" 111"} stroke={accent} strokeWidth="22" fill="none" strokeLinecap="round"/>
 <circle cx={x} cy="52" r="16" fill="#e9b18c"/>
 <path d={"M"+(x-15)+" 49 Q"+(x-13)+" 27 "+x+" 32 Q"+(x+14)+" 32 "+(x+15)+" 49"} fill="#684c43"/>
 <circle cx={x+6} cy="54" r="2" fill="#65463b"/>
 {id==="bands"&&<path d={"M"+left[0]+" "+left[1]+" Q108 125 "+right[0]+" "+right[1]} stroke="#c9669d" strokeWidth="5" fill="none"/>}
 {id==="mobility"&&<path d="M58 95 L162 101" stroke="#b08b65" strokeWidth="5"/>}
 </svg>;
}
