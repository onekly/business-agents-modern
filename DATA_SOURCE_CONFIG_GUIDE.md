# Data Source Configuration Guide

This guide explains how to configure your Google Sheets data sources for use in AI workflows.

## 🎯 Overview

Once you've connected Google Sheets, you can configure how the data should be processed, transformed, and used in your AI workflows.

## 📋 Configuration Options

### 1. **Basic Settings**
- **Name**: Custom name for your data source
- **Description**: Brief description of what this data contains
- **Data Range**: Specify which cells to read (e.g., A1:Z1000)
- **Sync Frequency**: How often to update the data
  - Real-time: Updates immediately when data changes
  - Hourly: Updates every hour
  - Daily: Updates once per day
  - Weekly: Updates once per week
  - Manual: Only updates when you manually sync
- **Output Format**: How to format the data for workflows
  - JSON: Structured data format
  - CSV: Comma-separated values
  - Excel: Excel file format
  - Raw: Original spreadsheet format

### 2. **Data Transformation Rules**
Transform your data before it's used in workflows:

- **Rename Columns**: Change column names for better readability
- **Format Data**: Convert data types (text to numbers, dates, etc.)
- **Calculate Fields**: Create new calculated columns
- **Filter Rows**: Remove unwanted rows based on conditions
- **Sort Data**: Organize data in a specific order

### 3. **Data Filters**
Filter your data to only include relevant rows:

- **Column**: Choose which column to filter
- **Operator**: Select comparison type (equals, contains, greater than, etc.)
- **Value**: Enter the value to filter by
- **Multiple Conditions**: Add multiple filters for complex filtering

### 4. **AI Processing**
Enable AI to process your data automatically:

- **Task Type**: Choose what the AI should do
  - Analyze Data: Find patterns and insights
  - Extract Insights: Pull out key information
  - Classify Data: Categorize rows
  - Summarize Data: Create summaries
  - Generate Recommendations: Suggest actions
- **AI Prompt**: Customize what the AI should focus on
- **AI Model**: Choose which AI model to use

### 5. **Data Preview**
See exactly how your data will look after processing:
- View first 10 rows of processed data
- Check column names and data types
- Verify transformations and filters are working

## 🚀 How to Configure

### Step 1: Connect Google Sheets
1. Go to Data Sources page
2. Click "Add Data Source"
3. Click "Connect" for Google Sheets
4. Complete OAuth authentication
5. Search and select your spreadsheet
6. Choose the sheet you want to use

### Step 2: Configure Your Data Source
1. Click "Configure" button on your selected sheet
2. Fill in basic settings (name, description, range)
3. Set up data transformations if needed
4. Add filters to focus on relevant data
5. Enable AI processing if desired
6. Preview your data to verify everything looks correct
7. Click "Save Configuration"

### Step 3: Use in Workflows
Once configured, your data source can be used in AI workflows:
- Select it as a data source step
- AI will process it according to your configuration
- Data will sync automatically based on your frequency setting

## 💡 Best Practices

### **Data Range Selection**
- Use specific ranges (A1:Z100) instead of entire columns
- Include headers in your range
- Consider data growth when setting ranges

### **Transformation Rules**
- Start with simple transformations
- Test each rule individually
- Use descriptive names for calculated fields

### **Filtering**
- Filter out empty rows and test data
- Use multiple conditions for complex filtering
- Test filters with preview before saving

### **AI Processing**
- Write clear, specific prompts
- Choose the right AI model for your task
- Start with simple analysis tasks

### **Sync Frequency**
- Use real-time for critical data
- Use hourly/daily for less critical data
- Use manual for one-time analysis

## 🔧 Advanced Configuration

### **Multiple Data Sources**
You can configure multiple data sources from the same or different spreadsheets:
- Each configuration is independent
- Different sync frequencies per source
- Different AI processing per source

### **Data Source Management**
- View all configured sources
- Sync data manually
- Pause/resume data sources
- Edit configurations
- Delete unused sources

### **Integration with Workflows**
Configured data sources automatically appear in workflow builders:
- Select as data input
- Use in AI processing steps
- Export results back to sheets

## 🛠️ Troubleshooting

### **Common Issues**

1. **Data not syncing**
   - Check if Google Sheets connection is still valid
   - Verify the data range is correct
   - Check sync frequency settings

2. **Transformations not working**
   - Verify column names match exactly
   - Check transformation rule syntax
   - Test with preview first

3. **AI processing errors**
   - Ensure AI service (Ollama) is running
   - Check AI prompt is clear and specific
   - Verify data format is compatible

4. **Filter issues**
   - Check column names are correct
   - Verify filter values match data format
   - Test filters with preview

### **Debug Tips**
- Use the preview tab to verify data looks correct
- Test configurations with small data samples first
- Check browser console for error messages
- Verify Google Sheets permissions

## 📈 Next Steps

Once your data sources are configured:

1. **Create Workflows**: Build AI workflows that use your data
2. **Set up Automation**: Schedule regular data processing
3. **Monitor Performance**: Check sync status and data quality
4. **Iterate and Improve**: Refine configurations based on results

Your configured data sources are now ready to power your AI workflows! 🎉
