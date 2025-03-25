import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const parentPageId = process.env.PARENT_PAGE_ID;

const year = new Date().getFullYear();

async function createWeeklyTodoLists(): Promise<void> {
  try {
    const jan1 = new Date(year, 0, 1);
    const startDate = new Date(jan1);    
    const endDate = new Date(year, 11, 31);
    
    let currentDate = new Date(startDate);
    let weekCounter = 1;
    
    while (currentDate <= endDate) {
      // Get the end date for this week (Saturday or Dec 31, whichever comes first)
      const weekEndDate = new Date(currentDate);
      const daysToSaturday = (6 - currentDate.getDay() + 7) % 7; // Days until Saturday
      weekEndDate.setDate(currentDate.getDate() + daysToSaturday);
      
      // If the week end date is beyond Dec 31, adjust it to Dec 31
      if (weekEndDate > endDate) {
        weekEndDate.setTime(endDate.getTime());
      }
      
      await createWeekTodoPage(currentDate, weekCounter, weekEndDate);
      
      // Move to next Sunday (or next day after the week end)
      currentDate = new Date(weekEndDate);
      currentDate.setDate(currentDate.getDate() + 1);
      weekCounter++;
      
      // If we've reached the end of the year, break out of the loop
      if (currentDate > endDate) {
        break;
      }
    }
    
    console.info(`Weekly todo lists created successfully for ${year}!`);
  } catch (error) {
    console.error("Error creating weekly todo lists:", error);
  }
}

async function createWeekTodoPage(startOfWeek: Date, weekNumber: number, endOfWeek: Date): Promise<void> {
  try {
    
    const weekTitle = `Week ${weekNumber} (${formatDate(startOfWeek)} - ${formatDate(endOfWeek)})`;
    
    // Create the week page
    const weekPage = await notion.pages.create({
      parent: {
        type: "page_id",
        page_id: parentPageId as string
      },
      properties: {
        title: {
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: weekTitle
              }
            }
          ]
        }
      }
    });
    
    // Create each day of the week with a todo item
    const daysContent: Array<{
      type: string;
      heading_3?: {
        rich_text: Array<{
          type: string;
          text: { content: string }
        }>
      };
      to_do?: {
        rich_text: Array<{
          type: string;
          text: { content: string; link: null }
        }>;
        checked: boolean;
        color: string
      }
    }> = [];
    
    const currentDate = new Date(startOfWeek);
    const endDate = new Date(endOfWeek);
    
    // Loop until we reach the end date
    while (currentDate <= endDate) {
      // Add day heading
      daysContent.push({
        type: "heading_3",
        heading_3: {
          rich_text: [
            {
              type: "text",
              text: {
                content: formatDayHeader(currentDate)
              }
            }
          ]
        }
      });
      
      daysContent.push({
        type: "to_do",
        to_do: {
          rich_text: [
            {
              type: "text",
              text: {
                content: " ", // DEFAULT TEXT HERE 
                link: null
              }
            }
          ],
          checked: false,
          color: "default"
        }
      });
      
      currentDate.setDate(currentDate.getDate() + 1); // move to next day
    }
    
    // Add the days content to the week page
    await notion.blocks.children.append({
      block_id: weekPage.id,
      children: daysContent as any
    });
    
    console.info(`Created: ${weekTitle}`);
  } catch (error) {
    console.error(`Error creating week page: ${error}`);
  }
}

// Helper function to format date as "Month Day"
function formatDate(date: Date): string {
  return date.toLocaleString('default', { month: 'long', day: 'numeric' });
}

// Helper function to format day header as "Weekday, Month Day"
function formatDayHeader(date: Date): string {
  return date.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' });
}

createWeeklyTodoLists()
  .then(() => console.info("Process completed successfully"))
  .catch(error => console.error("Process failed:", error));