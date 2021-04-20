package Hampus.place.webhook;

import Hampus.place.Pixel;
import Hampus.place.redis.RedisMessagePublisher;
import Hampus.place.redis.RedisRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping
@Slf4j
public class Webhook {

  @Autowired
  SimpMessagingTemplate template;

  @Autowired
  RedisRepo redisRepo;

  @Autowired
  RedisMessagePublisher redisMessagePublisher;

  ObjectMapper objectMapper = new ObjectMapper();

  @Value("${spring.redis.host}")
  String redisHost;

  @GetMapping("/")
  public @ResponseBody String test(){
    log.info("GetMapping on /");
    return redisHost + " " +redisRepo.getPixel(0,0);
  }


  @SneakyThrows
  @SubscribeMapping("/topic/place") //app/subscribe
  public byte[] sendOneTimeMessage() {
    log.info("A subscriber Connected");
    var allPixels = redisRepo.getAllPixels();
    return allPixels;
  }

  @SneakyThrows
  @MessageMapping("/pixel")
  public void pixels(@Payload String pixel)  {
    log.info("Got a Pixel from client: {} ", pixel);
    Pixel p = objectMapper.readValue(pixel,Pixel.class);
    redisRepo.setPixel(p);
    redisMessagePublisher.publish(p);
  }

  @SneakyThrows
  public void sendPixel(Pixel p){
    log.info("Sending Pixel: {}", p);
    template.convertAndSend("/topic/place", objectMapper.writeValueAsString(p));
  }




}
