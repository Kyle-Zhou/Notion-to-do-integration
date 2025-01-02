const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

let year = 2025;
for (let month=1; month<=12; month++){
    await create_todo_page(notion, month, "16f18c9c1978805aae41f66498c11e16"); // MAKE SURE YOU CHANGE THIS TO THE ID OF THE NEW PAGE OR IT WILL OVERWRITE PREVIOUS DATA LEARNED THIS THE HARD WAY
}
console.info("Completed successfully");


async function create_todo_page (client:any, month:number, parent_id:string ){
    const month_as_date = new Date(year,month,0);
    const response = await client.pages.create({
        "parent": {
            "type": "page_id",
            "page_id": parent_id
        },
        "properties": {
            "title" : {
                "id": "title",
                "type": "title",
                "title": [
                    {
                        "type": "text",
                        "text": {
                            "content": month_as_date.toLocaleString('default', { month: 'long' })
                        }
                    }
                ]
            }
        }
    });
    let subpage_parent_id = response.id;
    const daysInMonth = month_as_date.getDate();
    let weeksInMonth = createNestedArray(daysInMonth);
    for (let week of weeksInMonth){
        let child_array = [];
        for (let day of week){
            const day_as_string = new Date(year,month-1, day);
            child_array.push({
                "type": "heading_3",
                "heading_3":{
                    "rich_text": [
                        {
                        "type": "text",
                        "text": {
                            "content": day_as_string.toLocaleString('default', { weekday: 'long' }) + " " + day_as_string.toLocaleString('default', { month: 'long' }) + " " + day_as_string.getDate()
                        }
                        }
                    ]
                }
              });
              child_array.push(
                {
                    "type": "to_do",
                    "to_do": {
                      "rich_text": [{
                        "type": "text",
                        "text": {
                          "content": "Write stuff here",
                          "link": null
                        }
                      }],
                      "checked": false,
                      "color": "default",
                    }
                  }
              )
        }
        let week_title = month_as_date.toLocaleString('default', { month: 'long' }) + " " + week[0] + " - " + week[week.length-1];
        const page = await client.pages.create({
            "parent": {
                "type": "page_id",
                "page_id": subpage_parent_id
            },
            "properties": {
                "title" : {
                    "id": "title",
                    "type": "title",
                    "title": [
                        {
                            "type": "text",
                            "text": {
                                "content": week_title
                            }
                        }
                    ]
                }
            },
            "children": child_array
        });
    }


}



function createNestedArray(daysInMonth: number): number[][] {
    let weeks: number[][] = []; // outer array for weeks
    let week: number[] = []; // inner array for days in a week
  
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day); // Add day to the current week
      if (day % 7 === 0 || day === daysInMonth) { // End of week or end of month
        weeks.push(week); // Add the week to the weeks array
        week = []; // Reset the week array for the next week
      }
    }
  
    return weeks;
  }
  


