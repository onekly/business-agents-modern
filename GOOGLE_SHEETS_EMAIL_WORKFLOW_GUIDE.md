# Google Sheets + Email Automation Workflow Guide

This guide explains how to create and use workflows that integrate Google Sheets data with AI-powered email automation.

## 🎯 Overview

The system allows you to:
1. **Retrieve data** from Google Sheets (contacts, leads, customer data)
2. **Analyze data** using AI to understand preferences and segment contacts
3. **Generate personalized content** using AI for each contact
4. **Send bulk emails** with personalized content
5. **Track results** and update Google Sheets with campaign data

## 🚀 Quick Start

### 1. **Access the Demo**
- Navigate to `/workflows/demo-email` to see a live demo
- Or go to `/workflows` and select "Google Sheets Email Automation" template

### 2. **Configure Google Sheets Data Source**
- Go to `/data-sources`
- Click "Add Data Source" → "Connect" for Google Sheets
- Complete OAuth authentication
- Select your spreadsheet and sheet
- Click "Configure" to set up data processing rules

### 3. **Create Email Automation Workflow**
- Go to `/workflows`
- Click "Templates" → "Google Sheets Email Automation"
- Customize the workflow steps
- Save and execute

## 📋 Workflow Templates

### **1. Google Sheets Email Automation**
**Purpose**: Send personalized emails to contacts from Google Sheets

**Steps**:
1. **Load Google Sheets Data** - Retrieve contact information
2. **Analyze Contact Data** - AI analyzes preferences and segments contacts
3. **Generate Email Content** - AI creates personalized email content
4. **Send Emails** - Send bulk personalized emails
5. **Update Tracking Data** - Log results back to Google Sheets

**Use Cases**:
- Marketing campaigns
- Newsletter distribution
- Product announcements
- Customer follow-ups

### **2. Customer Feedback Analysis**
**Purpose**: Analyze customer feedback from Google Sheets

**Steps**:
1. **Load Feedback Data** - Retrieve feedback from Google Sheets
2. **Analyze Sentiment** - AI analyzes sentiment and categorizes feedback
3. **Generate Report** - AI creates comprehensive analysis report
4. **Save Analysis Results** - Store results back to Google Sheets

**Use Cases**:
- Customer satisfaction analysis
- Product improvement insights
- Support ticket analysis

### **3. Lead Nurturing Campaign**
**Purpose**: Automated lead nurturing using Google Sheets data

**Steps**:
1. **Load Lead Data** - Retrieve lead information
2. **Segment Leads** - AI segments leads by behavior and characteristics
3. **Generate Personalized Content** - AI creates content for each segment
4. **Send Campaign Emails** - Send segmented email campaigns
5. **Update Lead Status** - Track campaign results

**Use Cases**:
- Lead qualification
- Sales nurturing
- Re-engagement campaigns

## 🔧 Configuration Options

### **Data Source Configuration**

#### **Basic Settings**
- **Name**: Custom name for your data source
- **Description**: Brief description
- **Data Range**: Specify cells to read (e.g., A1:Z1000)
- **Sync Frequency**: How often to update data
  - Real-time: Updates immediately
  - Hourly: Updates every hour
  - Daily: Updates once per day
  - Weekly: Updates once per week
  - Manual: Only when you sync

#### **Data Transformation**
- **Rename Columns**: Change column names for better readability
- **Format Data**: Convert data types (text to numbers, dates)
- **Calculate Fields**: Create new calculated columns
- **Filter Rows**: Remove unwanted rows
- **Sort Data**: Organize data in specific order

#### **Filters**
- **Column**: Choose which column to filter
- **Operator**: Select comparison type (equals, contains, greater than, etc.)
- **Value**: Enter the value to filter by
- **Multiple Conditions**: Add multiple filters

#### **AI Processing**
- **Task Type**: Choose what the AI should do
  - Analyze Data: Find patterns and insights
  - Extract Insights: Pull out key information
  - Classify Data: Categorize rows
  - Summarize Data: Create summaries
  - Generate Recommendations: Suggest actions
- **AI Prompt**: Customize what the AI should focus on
- **AI Model**: Choose which AI model to use

### **Email Configuration**

#### **Email Templates**
- **Subject Line**: Dynamic subject with placeholders
- **Content**: Personalized email body
- **Placeholders**: Use {{name}}, {{company}}, {{preferences}} etc.

#### **Personalization Options**
- **Contact Name**: Personalize with recipient's name
- **Company Information**: Include company-specific details
- **Previous Interactions**: Reference past communications
- **Preferences**: Use contact preferences for content

#### **Sending Options**
- **Bulk Sending**: Send to multiple recipients
- **Rate Limiting**: Control sending speed
- **Error Handling**: Retry failed sends
- **Delivery Tracking**: Monitor email delivery

## 📊 Data Requirements

### **Google Sheets Format**

#### **Contact Data Sheet**
| Name | Email | Company | Preferences | Last Contact | Status |
|------|-------|---------|-------------|--------------|--------|
| John Doe | john@example.com | Acme Corp | product updates | 2024-01-15 | active |
| Jane Smith | jane@example.com | Tech Inc | newsletters | 2024-01-10 | active |

#### **Required Columns**
- **Name**: Contact's full name
- **Email**: Valid email address
- **Company**: Company name (optional)
- **Preferences**: Contact preferences (optional)

#### **Optional Columns**
- **Phone**: Phone number
- **Title**: Job title
- **Industry**: Industry sector
- **Last Contact**: Date of last contact
- **Status**: Contact status (active, inactive, unsubscribed)
- **Segment**: Contact segment
- **Custom Fields**: Any additional data

### **Email Log Sheet** (for tracking)
| Timestamp | Recipient | Subject | Status | Message ID | Campaign |
|-----------|-----------|---------|--------|------------|----------|
| 2024-01-20 10:00 | john@example.com | Product Update | sent | msg_001 | campaign_1 |

## 🤖 AI Integration

### **Available AI Models**
- **Gemma 3:1b**: Fast, lightweight model for quick tasks
- **Gemma 2:2b**: Balanced model for general use
- **Llama 3.2:3b**: Advanced model for complex tasks

### **AI Task Types**

#### **Data Analysis**
- **Sentiment Analysis**: Analyze text sentiment
- **Pattern Recognition**: Find patterns in data
- **Segmentation**: Group contacts by characteristics
- **Trend Analysis**: Identify trends over time

#### **Content Generation**
- **Email Writing**: Generate personalized emails
- **Subject Lines**: Create compelling subject lines
- **Call-to-Actions**: Generate effective CTAs
- **Follow-up Content**: Create follow-up sequences

#### **Personalization**
- **Dynamic Content**: Adapt content to recipient
- **Tone Matching**: Match brand voice
- **Language Adaptation**: Adjust for different audiences
- **Context Awareness**: Use relevant context

## 📈 Monitoring and Analytics

### **Workflow Execution**
- **Real-time Progress**: See step-by-step execution
- **Status Updates**: Track completion status
- **Error Handling**: Identify and resolve issues
- **Performance Metrics**: Monitor execution time

### **Email Campaign Metrics**
- **Delivery Rate**: Percentage of emails delivered
- **Open Rate**: Percentage of emails opened
- **Click Rate**: Percentage of links clicked
- **Response Rate**: Percentage of responses received

### **Data Insights**
- **Contact Engagement**: Track contact interactions
- **Content Performance**: Analyze content effectiveness
- **Segmentation Results**: Review segmentation accuracy
- **ROI Analysis**: Measure campaign effectiveness

## 🛠️ Troubleshooting

### **Common Issues**

#### **Google Sheets Connection**
- **Authentication Failed**: Check OAuth credentials
- **Permission Denied**: Verify sheet permissions
- **Data Not Loading**: Check data range and format
- **Sync Issues**: Verify sync frequency settings

#### **AI Processing**
- **Model Not Available**: Check Ollama is running
- **Poor Results**: Adjust prompts and parameters
- **Timeout Errors**: Increase timeout settings
- **Memory Issues**: Use smaller models or batches

#### **Email Sending**
- **Delivery Failed**: Check email addresses
- **Rate Limiting**: Adjust sending speed
- **Template Errors**: Verify placeholder syntax
- **Authentication Issues**: Check email service credentials

### **Debug Tips**
1. **Check Logs**: Review console logs for errors
2. **Test Components**: Test each step individually
3. **Verify Data**: Check data format and content
4. **Monitor Resources**: Ensure adequate system resources

## 🚀 Advanced Features

### **Custom Workflows**
- **Multi-step Processes**: Chain multiple operations
- **Conditional Logic**: Add decision points
- **Parallel Processing**: Execute steps simultaneously
- **Error Recovery**: Handle failures gracefully

### **Integration Options**
- **CRM Systems**: Connect with Salesforce, HubSpot
- **Email Services**: Integrate with SendGrid, Mailchimp
- **Analytics Tools**: Connect with Google Analytics
- **Database Systems**: Link with PostgreSQL, MySQL

### **Automation Triggers**
- **Scheduled Runs**: Set up recurring executions
- **Event Triggers**: Respond to specific events
- **Webhook Integration**: Trigger from external systems
- **Manual Execution**: Run on-demand

## 📚 Best Practices

### **Data Management**
- **Keep Data Clean**: Regularly clean and validate data
- **Use Consistent Formats**: Standardize data formats
- **Backup Regularly**: Keep data backups
- **Monitor Changes**: Track data modifications

### **Email Best Practices**
- **Personalize Content**: Use recipient-specific information
- **Test Before Sending**: Preview emails before sending
- **Respect Preferences**: Honor unsubscribe requests
- **Monitor Deliverability**: Track email delivery rates

### **AI Optimization**
- **Clear Prompts**: Write specific, clear prompts
- **Iterate and Improve**: Continuously refine prompts
- **Monitor Performance**: Track AI response quality
- **Use Appropriate Models**: Choose the right model for the task

## 🎯 Next Steps

1. **Set Up Your First Workflow**: Start with the demo workflow
2. **Configure Data Sources**: Connect your Google Sheets
3. **Customize Templates**: Adapt workflows to your needs
4. **Monitor Results**: Track performance and optimize
5. **Scale Up**: Expand to more complex workflows

Your Google Sheets + Email automation system is now ready to power your marketing and communication workflows! 🎉
