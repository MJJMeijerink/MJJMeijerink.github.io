import json

with open('data.csv', 'r') as f:
    data = f.readlines()[5:]

countryC = []
pop = []
names = []
fillKeys = []
colorS = ['c0c0c0', 'fee5d9', 'fcae91', 'fb6a4a', 'de2d26', 'a50f15'];

for x in data:
    x = x.split(',')
    c = x[1].strip('"')
    c = c.strip()
    name = x[0].strip('"')
    if x[58] != '""':
        p = float(x[58].strip('"'))
    else:
        p = 0 #For unknown data

    if c != c.upper() or len(c) != 3: #Correcting for some extra commas in data
        c = x[2].strip('"')
        c = c.strip()
        if x[59] != '""':
            p = float(x[59].strip('"'))
        else:
            p = 0 #For unknown data

    if p > 0 and p <= 5:
        fillKeys.append(colorS[1])
    elif p > 5 and p <= 10:
        fillKeys.append(colorS[2])
    elif p > 10 and p <= 15:
        fillKeys.append(colorS[3])
    elif p > 15 and p <= 20:
        fillKeys.append(colorS[4])
    elif p > 20: 
        fillKeys.append(colorS[5])
    elif p == 0:
        fillKeys.append(colorS[0])
    
    countryC.append(c)
    pop.append(p)
    names.append(name)

allData={}
for i, x in enumerate(countryC):
    attrs = {}
    attrs['population'] = pop[i]
    attrs['name'] = names[i]
    attrs['fillKey'] = fillKeys[i]
    allData[x] = attrs
    
def write(data):
    jsonfile = open('data.json', 'w')
    json.dump(allData, jsonfile)
    return

if __name__ == '__main__':
    write(allData)
