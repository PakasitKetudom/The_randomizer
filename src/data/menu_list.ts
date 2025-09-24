export type Menus = {
  id: string;
  nameTH: string;
  timeOfDay: ("breakfast" | "lunch" | "dinner")[];
  tags: string[];
  budget?: number;
  cookMins?: number;
};

export const MENUS: Menus[] = [
  { id: "krapao", nameTH: "ข้าวกะเพราหมูไข่ดาว", timeOfDay: ["lunch","dinner"], tags:["thai","spicy","budget"], budget: 60, cookMins: 10 },
  { id: "khaotom", nameTH: "ข้าวต้มปลา", timeOfDay: ["breakfast","dinner"], tags:["thai","light"], budget: 80, cookMins: 20 },
  { id: "omelet-rice", nameTH: "ข้าวไข่เจียวหมูสับ", timeOfDay: ["breakfast","lunch","dinner"], tags:["thai","budget"], budget: 45, cookMins: 8 },
  { id: "somtum", nameTH: "ส้มตำไทย", timeOfDay: ["lunch","dinner"], tags:["thai","spicy","vegetarian"], budget: 50, cookMins: 10 },
];
