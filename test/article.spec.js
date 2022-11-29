const request = require("supertest")
const {app } = require("../server")
const mockingoose = require('mockingoose')
const articleSchema = require("../models/article.schema")

describe("test du controleur Article", () =>{

    const articleTest = [{
        _id:"",
        libelle: 'tshirt test',
        image: 'url',
        description: 'test',
        price:10
    }];

    beforeEach(()=>{
        //avant chaque test on va mocké simuler une base de données:
        mockingoose(articleSchema).toReturn(articleTest, 'save');
        mockingoose(articleSchema).toReturn(articleTest, 'find');
    });

    it('ajoute un article', async ()=>{
        const res = await request(app).post('/article/add').send({
            libelle: 'tshirt test',
            image: 'url',
            description: 'test',
            price:10
         })
        expect(res.status).toBe(200)
        expect(res?.body.Success).toBe(true)
        expect(res?.body.Message).toEqual("l'article a été ajouté");
    })

    it("afficher tout les article existant", async () => {
        const res = await request(app).get("/article/getall");
        let long = res.body.data.articles.length;
        // id = res.body.data.articles[long - 1]._id;
        expect(res.status).toBe(200);
        expect(long).toBeGreaterThan(0);
    });


})
