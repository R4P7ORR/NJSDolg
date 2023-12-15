import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { Response } from 'express';
import { MovieDTO } from './MovieDTO';

const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'njscinema',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('MainPage')
  async main() {
    const [data, types] = await conn.execute("SELECT * FROM movie ORDER BY title");
    return { data };
  }

  @Get('/newCoupon')
  @Render('newCoupon')
  nCoupon(){
    return {errorMessage: '',title:'',percentage:'', code:''};
  }

  @Post('/newCoupon')
  @Render('newCoupon')
  async nCouponPost(@Body() movie: MovieDTO, @Res() response: Response){
     const title = movie.title;
     const percentage = movie.percentage;
     const code = movie.code;
     let errorMessage = '';

     if (title.trim().length < 1){
      errorMessage = "The title MUST be a minimum length of 1 character!";
      return {errorMessage, title: '', percentage, code};
     }
     if (isNaN(percentage) || percentage < 1 || percentage >99){
      errorMessage = "The percentage MUST only consist of numbers between 1 and 99!"
      return {errorMessage, title, percentage: '', code};
     }
     if (!new RegExp(/^[a-zA-Z]{4}-[0-9]{6}/).test(code)){
      errorMessage = "The code does not meet the required form! (ABCD-123456)"
      return {errorMessage, title, percentage, code: ''};
     }
     const [result] = await conn.execute("INSERT INTO movie (title, percentage, code) VALUES(?,?,?)", [title, percentage, code]);

     response.redirect('/');
  }
}
