import Image from "next/image";
const images = {
  "Cerebro y sistema nervioso": "brain",
  "Ojos": "eyes",
  "Oídos": "ears",
  "Boca y dientes": "mouth",
  "Corazón": "heart",
  "Pulmones": "lungs",
  "Tiroides": "thyroid",
  "Hígado": "liver",
  "Estómago": "stomach",
  "Intestino delgado": "small-intestine",
  "Colon e intestino grueso": "colon",
  "Sistema digestivo": "digestive-system",
  "Páncreas": "pancreas",
  "Vesícula biliar": "gallbladder",
  "Bazo": "spleen",
  "Riñones": "kidneys",
  "Vejiga": "bladder",
  "Sistema reproductor": "reproductive-system",
  "Huesos": "bones",
  "Articulaciones": "joints",
  "Músculos": "muscles",
  "Piel": "skin",
  "Cabello y uñas": "hair-nails",
  "Sangre y circulación": "circulation"
};
export default function HealthArtwork({name,detail=false}){return <Image className={detail?"healthOrganDetailPhoto":"healthOrganPhoto"} src={`/health-organs/${images[name]}.webp`} alt={name+(["Intestino delgado","Colon e intestino grueso"].includes(name)?" resaltado a color; el resto del intestino aparece oscuro":"")} width={256} height={256} sizes={detail?"360px":"(max-width:600px) 40vw, 240px"}/>;}
