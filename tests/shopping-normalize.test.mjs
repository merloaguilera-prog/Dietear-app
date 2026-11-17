import test from "node:test";
import assert from "node:assert/strict";
import {parseManualShoppingItem,shoppingProductKey} from "../lib/shopping-normalize.js";

test("yogur singular y plural se agrupan",()=>{
 assert.equal(parseManualShoppingItem("1 yogur").key,parseManualShoppingItem("2 yogures").key);
 assert.equal(parseManualShoppingItem("2 yogures").qty,2);
});

test("sin lactosa nunca se mezcla con el lácteo normal",()=>{
 assert.notEqual(parseManualShoppingItem("1 yogur sin lactosa").key,parseManualShoppingItem("1 yogur").key);
 assert.notEqual(parseManualShoppingItem("1 leche sin lactosa").key,parseManualShoppingItem("1 leche").key);
});

test("no se suman cantidades con unidades incompatibles",()=>{
 assert.notEqual(parseManualShoppingItem("200 g tomate").key,parseManualShoppingItem("2 kg tomates").key);
 assert.equal(parseManualShoppingItem("200 g tomate").unit,"g");
});

test("las comidas compuestas no se convierten en productos",()=>{
 assert.equal(parseManualShoppingItem("Pollo con arroz"),null);
 assert.equal(parseManualShoppingItem("1 arroz con pollo"),null);
});

test("los nombres se normalizan sin perder restricciones",()=>{
 assert.equal(shoppingProductKey("Tomates"),"tomate");
 assert.equal(shoppingProductKey("Yogures sin lactosa"),"yogur sin lactosa");
});
