# collecting-electron
This is an electron application to collect examination information.

## How to Use

### Preparation

You have to prepare a excel file that has `ID`, `Q`, and `HINT` headers.

![](./data/excel_sample.png)


### Demo

![](./data/demo.gif)

### Output

An output file is like below,

```
ID,start,first-focusin,hint,end,answer
1,2019/8/17 23:45:22.896,2019/8/17 23:45:29.715,,2019/8/17 23:45:31.153,swimmer
2,2019/8/17 23:45:31.153,2019/8/17 23:45:32.917,2019/8/17 23:45:35.693,2019/8/17 23:45:39.824,climber
```

## How to Build

```
npm install -g electron-packager
npm install .
electron-packager . --electronVersion=6.0.7 --overwrite --out out --ignore data
```
