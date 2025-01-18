import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root',
})
export class SeoSocialShareService {

    pureTitle: string;

    constructor(
        private readonly metaService: Meta,
        private readonly titleService: Title
    ) {
    }

    setData(data: any) {
        this.setTitle(data.title);
        this.setDescription(data.description)
        this.setType(data.large, data.website)
        this.setSite(data.site)
        this.setImage(data.image)
    }

     setTitle(title: string = '', notifications?: number) {
        this.pureTitle = title;
        if(!!notifications && notifications > 0){

            this.titleService.setTitle(`(${notifications}) ${title.replace(/\s*\(.*?\)\s*/g, '')}`);
        } 
        else {
            this.titleService.setTitle(title);
        }
       
        if (title && title.length) {
            this.metaService.updateTag({ name: 'twitter:title', content: title });
            this.metaService.updateTag({ name: 'twitter:image:alt', content: title });
            this.metaService.updateTag({ property: 'og:image:alt', content: title });
            this.metaService.updateTag({ property: 'og:title', content: title });
            this.metaService.updateTag({ name: 'title', content: title });
        } else {
            this.metaService.removeTag(`name='twitter:title'`);
            this.metaService.removeTag(`name='twitter:image:alt'`);
            this.metaService.removeTag(`property='og:image:alt'`);
            this.metaService.removeTag(`property='og:title'`);
            this.metaService.removeTag(`name='title'`);
        }
    }

    private setDescription(description: string = '') {

        if (description && description.length) {
            let stripped = description.replace(/(<([^>]+)>)/ig,"").substring(0,200);
            this.metaService.updateTag({ name: 'description', content: stripped });
            this.metaService.updateTag({ name: 'og:description', content: stripped });
            this.metaService.updateTag({ name: 'twitter:description', content: stripped });
        } else {
            this.metaService.removeTag("name='twitter:description'");
            this.metaService.removeTag("property='og:description'");
            this.metaService.removeTag("name='description'");
        }
    }

    private setImage(image: string) {

        if (image && image.length) {
            this.metaService.updateTag({ name: 'twitter:image', content: image });
            this.metaService.updateTag({ property: 'og:image', content: image });
        } else {
            this.metaService.removeTag("name='twitter:image'");
            this.metaService.removeTag("property='og:image'");
        }
    }



    private setSite(site: string) {

        if (site && site.length) {
            this.metaService.updateTag({ name: 'twitter:site', content: '@discuss_thegame' });
            this.metaService.updateTag({ property: 'og:url', content: site });
            this.metaService.updateTag({ property: 'og:site_name', content: 'Discuss the Game' });
        } else {
            this.metaService.removeTag("name='twitter:site'");
            this.metaService.removeTag("property='og:url'");
            this.metaService.removeTag("property='og:site_name'");
        }
    }

    private setType(large: boolean, website?: boolean) {

        if (website) {
            this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
            this.metaService.updateTag({ property: 'og:type', content: 'website' });
        }
        else if (large) {
            this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
            this.metaService.updateTag({ property: 'og:type', content: 'article' });
        } else {
            this.metaService.updateTag({ name: 'twitter:card', content: 'summary' });
            this.metaService.updateTag({ property: 'og:type', content: 'profile' });
        }
    }

}