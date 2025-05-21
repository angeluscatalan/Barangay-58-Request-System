export const getSexDisplay = (sex, sex_other) => {
  switch(sex) {
    case "1": return "Male";
    case "2": return "Female";
    case "3": return "Prefer not to say";
    case "4": return sex_other || "Other";
    default: return "Not specified";
  }
};