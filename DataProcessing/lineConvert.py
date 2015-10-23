import json

with open('KNMI.txt', 'r') as f:
    data = f.readlines()[12:]

temps = []
dates = []
for x in data:
    x = x.split(',')
    date = ''
    for i, number in enumerate(x[1]):
        date += number
        if i == 3:
            date += '/'
        elif i == 5:
            date += '/'
    dates.append(date)
    temps.append(int(x[2]))

allData = {}
allData['Dates'] = dates
allData['Temperatures'] = temps

def write(data):
    jsonfile = open('data.json', 'w')
    json.dump(allData, jsonfile)
    return

if __name__ == '__main__':
    write(allData)

