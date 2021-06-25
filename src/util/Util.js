export default class Util
{
    static getDisplayDate(dt) {

        let monthNames =["Jan","Feb","Mar","Apr",
                          "May","Jun","Jul","Aug",
                          "Sep", "Oct","Nov","Dec"];

        let day = dt.getDate();
        
        let monthIndex = dt.getMonth();
        let monthName = monthNames[monthIndex];
        
        let year = dt.getFullYear();
        
        return `${day} ${monthName} ${year}`;  
    }

}



