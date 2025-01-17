// this is roughly copied from my original implementation
 
export default class DataFrame {
  "1": number = 0;
  "2": number = 0;
  "3": number = 0;
  "4": number = 0;
  "5": number = 0;
  "6": number = 0;
  "7": number = 0;
  "8": number = 0;
  "9": number = 0;
  "10": number = 0;
  "11": number = 0;
  "12": number = 0;
  "13": number = 0;
  "14": number = 0;
  "15": number = 0;
  "16": number = 0;
  "17": number = 0;
  "18": number = 0;
  "19": number = 0;
  "20": number = 0;
  "21": number = 0;
  "22": number = 0;
  "23": number = 0;
  "24": number = 0;
  "25": number = 0;
  "26": number = 0;
  "27": number = 0;
  "28": number = 0;
  "29": number = 0;
  "30": number = 0;
  "31": number = 0;
  "32": number = 0;
  "33": number = 0;
  "34": number = 0;
  "35": number = 0;
  "36": number = 0;
  "37": number = 0;
  "38": number = 0;
  "39": number = 0;
  "40": number = 0;
  "41": number = 0;
  "42": number = 0;
  "43": number = 0;
  "44": number = 0;
  "45": number = 0;
  "46": number = 0;
  "47": number = 0;
  "48": number = 0;
  "49": number = 0;
  "50": number = 0;
  "51": number = 0;
  "52": number = 0;
  "53": number = 0;
  "54": number = 0;
  "55": number = 0;
  "56": number = 0;
  "57": number = 0;
  "58": number = 0;
  "59": number = 0;
  "60": number = 0;
  "61": number = 0;
  "62": number = 0;
  "63": number = 0;
  "64": number = 0;
  "65": number = 0;
  "66": number = 0;
  "67": number = 0;
  "68": number = 0;
  "69": number = 0;
  "70": number = 0;
  "71": number = 0;
  "72": number = 0;
  "73": number = 0;
  "74": number = 0;
  "75": number = 0;
  "76": number = 0;
  "77": number = 0;
  "78": number = 0;
  "79": number = 0;
  "80": number = 0;
  "81": number = 0;
  "82": number = 0;
  "83": number = 0;
  "84": number = 0;
  "85": number = 0;
  "86": number = 0;
  "87": number = 0;
  "88": number = 0;
  "89": number = 0;
  "90": number = 0;
  "91": number = 0;
  "92": number = 0;
  "93": number = 0;
  "94": number = 0;
  "95": number = 0;
  "96": number = 0;
  "97": number = 0;
  "98": number = 0;
  "99": number = 0;
  "100": number = 0;

  constructor(values: number[]) {
    // Get all the keys of the class
    const keys = Object.keys(this);

    if (values.length != keys.length) {
      console.warn(`WARN: ${values.length} columns recieved instead of ${keys.length}!`);
    }

    // Assign values from the array to the fields
    keys.forEach((key, index) => {
      (this as any)[key] = index < values.length ? values[index] : null;
    });
  }
}
