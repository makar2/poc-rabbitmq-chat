SHELL := bash
 
up-local:
	docker-compose -f docker-compose.yml -f devops/local/docker-compose.yml up -d --build

down-local:
	docker-compose -f docker-compose.yml -f devops/local/docker-compose.yml down

volumes-list:
	for i in $$(ls -A); do echo "- ./$$i:/app/$$i"; done

fix-chown:
	sudo chown -R $$USER:$$USER ./